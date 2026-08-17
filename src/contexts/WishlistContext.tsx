import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Product } from '../types';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  loading: boolean;
  error: string | null;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const configured = isSupabaseConfigured();

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track last fetched user to avoid duplicate fetches
  const lastFetchedUserId = useRef<string | null>(null);

  /**
   * Fetch wishlist rows for the authenticated user from public.wishlists,
   * joined with products and categories via PostgREST foreign key.
   *
   * Schema: public.wishlists (id, user_id, product_id, created_at)
   * FK: product_id → public.products.id
   */
  const fetchWishlist = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('wishlists')
        .select('id, product_id, products(*, categories(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        const ids = data.map((row: any) => row.product_id as string).filter(Boolean);
        const products = data
          .map((row: any) => row.products)
          .filter(Boolean) as Product[];

        setWishlistIds(ids);
        setWishlistProducts(products);
      } else {
        // User is authenticated but wishlist is empty — that is a valid state
        setWishlistIds([]);
        setWishlistProducts([]);
      }
    } catch (err: any) {
      console.error('[WishlistContext] fetchWishlist error:', err);
      setError(err.message || 'Failed to load wishlist. Please refresh.');
      setWishlistIds([]);
      setWishlistProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever auth state settles or user changes
  useEffect(() => {
    if (authLoading) {
      // Auth is still initializing — stay in loading state
      setLoading(true);
      return;
    }

    if (!configured) {
      setLoading(false);
      setError('Supabase is not configured.');
      return;
    }

    if (!user) {
      // User signed out — clear wishlist state
      setWishlistIds([]);
      setWishlistProducts([]);
      setLoading(false);
      setError(null);
      lastFetchedUserId.current = null;
      return;
    }

    // Avoid re-fetching if we already fetched for this user
    if (lastFetchedUserId.current === user.id) return;

    lastFetchedUserId.current = user.id;
    fetchWishlist(user.id);
  }, [authLoading, user, configured, fetchWishlist]);

  /**
   * Add a product to the wishlist.
   * 1. Optimistic UI update.
   * 2. INSERT into public.wishlists.
   * 3. Rollback on error.
   */
  const addToWishlist = async (product: Product): Promise<void> => {
    if (!user || !configured) return;
    if (wishlistIds.includes(product.id)) return; // Already in wishlist

    // Optimistic update
    setWishlistIds(prev => [...prev, product.id]);
    setWishlistProducts(prev => [...prev, product]);

    const { error: insertError } = await supabase
      .from('wishlists')
      .insert({ user_id: user.id, product_id: product.id });

    if (insertError) {
      // Duplicate entry is acceptable (unique constraint) — RLS handles it
      if (insertError.code === '23505') {
        // Row already exists — optimistic state is correct, no rollback needed
        console.warn('[WishlistContext] addToWishlist: row already exists (unique constraint)');
        return;
      }
      // Any other error — rollback optimistic update
      console.error('[WishlistContext] addToWishlist error:', insertError);
      setWishlistIds(prev => prev.filter(id => id !== product.id));
      setWishlistProducts(prev => prev.filter(p => p.id !== product.id));
      setError(insertError.message || 'Failed to add item to wishlist.');
    }
  };

  /**
   * Remove a product from the wishlist.
   * 1. Optimistic UI update.
   * 2. DELETE from public.wishlists where user_id + product_id.
   * 3. Rollback on error.
   */
  const removeFromWishlist = async (productId: string): Promise<void> => {
    if (!user || !configured) return;

    // Optimistic update — save previous state for rollback
    const prevIds = wishlistIds;
    const prevProducts = wishlistProducts;

    setWishlistIds(prev => prev.filter(id => id !== productId));
    setWishlistProducts(prev => prev.filter(p => p.id !== productId));

    const { error: deleteError } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (deleteError) {
      console.error('[WishlistContext] removeFromWishlist error:', deleteError);
      // Rollback
      setWishlistIds(prevIds);
      setWishlistProducts(prevProducts);
      setError(deleteError.message || 'Failed to remove item from wishlist.');
    }
  };

  const toggleWishlist = async (product: Product): Promise<void> => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistIds.includes(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
