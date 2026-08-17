import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import type { Product } from '../types';

export interface UseRecommendationsOptions {
  limit?: number;
  excludeProductId?: string;
}

const INTERACTION_WEIGHTS: Record<string, number> = {
  wishlist: 5,
  add_to_cart: 4,
  product_view: 2,
  search: 2,
  category_view: 1,
};

export const useRecommendations = (options: UseRecommendationsOptions = {}) => {
  const { limit = 4, excludeProductId } = options;

  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();
  const { wishlistIds } = useWishlist();
  const { items: cartItems } = useCart();
  const configured = isSupabaseConfigured();

  const lastFetchKeyRef = useRef<string>('');

  /**
   * Helper: Fetch popular / highly-rated in-stock fallback products.
   */
  const fetchFallbackProducts = useCallback(
    async (excludedSet: Set<string>, targetCount: number): Promise<Product[]> => {
      try {
        const { data, error: fetchErr } = await (supabase.from('products') as any)
          .select('*, categories(*)')
          .gt('stock', 0)
          .order('rating', { ascending: false, nullsFirst: false })
          .order('review_count', { ascending: false, nullsFirst: false })
          .limit(targetCount * 3);

        if (fetchErr || !data) {
          console.warn('[useRecommendations] Fallback fetch warning:', fetchErr?.message);
          return [];
        }

        const filtered = (data as Product[]).filter((p) => !excludedSet.has(String(p.id)));
        return filtered.slice(0, targetCount);
      } catch (err) {
        console.error('[useRecommendations] Fallback fetch error:', err);
        return [];
      }
    },
    []
  );

  /**
   * Primary recommendation generator.
   */
  const generateRecommendations = useCallback(async () => {
    if (authLoading) return;

    if (!configured) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Build excluded products set (wishlist + cart + current product)
    const cartProductIds = cartItems.map((item) => String(item.product.id));
    const excludedSet = new Set<string>([
      ...wishlistIds.map(String),
      ...cartProductIds,
      ...(excludeProductId ? [String(excludeProductId)] : []),
    ]);

    try {
      // 1. Logged-out users or no user id -> Fallback
      if (!user) {
        const fallback = await fetchFallbackProducts(excludedSet, limit);
        setRecommendations(fallback);
        setLoading(false);
        return;
      }

      // 2. Fetch user's recent interactions from public.user_interactions
      const { data: interactions, error: intErr } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (intErr) {
        console.warn('[useRecommendations] Failed to fetch user interactions:', intErr.message);
      }

      // 3. New users with 0 interactions -> Fallback
      if (!interactions || interactions.length === 0) {
        const fallback = await fetchFallbackProducts(excludedSet, limit);
        setRecommendations(fallback);
        setLoading(false);
        return;
      }

      // 4. Extract distinct numeric product IDs from interactions (ignore product_id = 0)
      const validProductIds = Array.from(
        new Set(
          interactions
            .map((i: any) => Number(i.product_id))
            .filter((id: number) => Number.isFinite(id) && id > 0)
        )
      );

      if (validProductIds.length === 0) {
        const fallback = await fetchFallbackProducts(excludedSet, limit);
        setRecommendations(fallback);
        setLoading(false);
        return;
      }

      // 5. Fetch product details for interacted products
      const { data: interactedProducts, error: prodErr } = await (supabase.from('products') as any)
        .select('*, categories(*)')
        .in('id', validProductIds);

      if (prodErr || !interactedProducts || interactedProducts.length === 0) {
        const fallback = await fetchFallbackProducts(excludedSet, limit);
        setRecommendations(fallback);
        setLoading(false);
        return;
      }

      // 6. Build weighted preference profiles
      const categoryWeights: Record<string, number> = {};
      const brandWeights: Record<string, number> = {};
      const prices: number[] = [];

      // Create lookup map for interacted products
      const prodMap = new Map<string, Product>();
      (interactedProducts as Product[]).forEach((p) => {
        prodMap.set(String(p.id), p);
      });

      // Accumulate interaction weights
      interactions.forEach((interaction: any) => {
        const pId = String(interaction.product_id);
        const product = prodMap.get(pId);
        if (!product) return;

        const weight = INTERACTION_WEIGHTS[interaction.interaction_type] || 1;

        if (product.category_id) {
          const catId = String(product.category_id);
          categoryWeights[catId] = (categoryWeights[catId] || 0) + weight;
        }

        if (product.brand) {
          const brandKey = product.brand.toLowerCase();
          brandWeights[brandKey] = (brandWeights[brandKey] || 0) + weight;
        }

        if (product.price && !isNaN(Number(product.price))) {
          prices.push(Number(product.price));
        }
      });

      const avgPrice =
        prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 100;

      // 7. Fetch in-stock candidate products from DB
      const { data: candidateProducts, error: candErr } = await (supabase.from('products') as any)
        .select('*, categories(*)')
        .gt('stock', 0)
        .limit(100);

      if (candErr || !candidateProducts) {
        console.warn('[useRecommendations] Candidate products fetch error:', candErr?.message);
        const fallback = await fetchFallbackProducts(excludedSet, limit);
        setRecommendations(fallback);
        setLoading(false);
        return;
      }

      // Filter out excluded products
      const availableCandidates = (candidateProducts as Product[]).filter(
        (p) => !excludedSet.has(String(p.id))
      );

      if (availableCandidates.length === 0) {
        const fallback = await fetchFallbackProducts(excludedSet, limit);
        setRecommendations(fallback);
        setLoading(false);
        return;
      }

      // 8. Multi-factor scoring algorithm
      const scoredCandidates = availableCandidates.map((product) => {
        let score = 0;

        // Category score (weight multiplier 10)
        if (product.category_id) {
          const catWeight = categoryWeights[String(product.category_id)] || 0;
          score += catWeight * 10;
        }

        // Brand score (weight multiplier 5)
        if (product.brand) {
          const brandWeight = brandWeights[product.brand.toLowerCase()] || 0;
          score += brandWeight * 5;
        }

        // Price similarity score (max 15 pts)
        const prodPrice = Number(product.price) || 0;
        const priceDiffRatio = Math.abs(prodPrice - avgPrice) / (avgPrice || 1);
        score += Math.max(0, 15 - priceDiffRatio * 10);

        // Rating & review count quality bonus
        const rating = Number(product.rating || 0);
        const reviewCount = Number(product.review_count || 0);
        score += rating * 3 + Math.min(reviewCount, 50) * 0.1;

        return { product, score };
      });

      // Sort by score descending
      scoredCandidates.sort((a, b) => b.score - a.score);

      let finalRecs = scoredCandidates.map((sc) => sc.product).slice(0, limit);

      // If we don't have enough recommendations, backfill with top-rated popular products
      if (finalRecs.length < limit) {
        const recIds = new Set(finalRecs.map((p) => String(p.id)));
        const backfillExcluded = new Set([...Array.from(excludedSet), ...Array.from(recIds)]);
        const backfill = await fetchFallbackProducts(
          backfillExcluded,
          limit - finalRecs.length
        );
        finalRecs = [...finalRecs, ...backfill];
      }

      setRecommendations(finalRecs);
    } catch (err: any) {
      console.error('[useRecommendations] Recommendation calculation failed:', err);
      setError(err.message || 'Failed to calculate recommendations');
      // Safe fallback on failure
      const fallback = await fetchFallbackProducts(excludedSet, limit);
      setRecommendations(fallback);
    } finally {
      setLoading(false);
    }
  }, [
    authLoading,
    configured,
    user,
    wishlistIds,
    cartItems,
    excludeProductId,
    limit,
    fetchFallbackProducts,
  ]);

  useEffect(() => {
    const fetchKey = `${user?.id || 'anon'}_${wishlistIds.length}_${cartItems.length}_${excludeProductId || ''}_${limit}`;
    if (lastFetchKeyRef.current === fetchKey && !loading) {
      return;
    }
    lastFetchKeyRef.current = fetchKey;
    generateRecommendations();
  }, [generateRecommendations, user, wishlistIds.length, cartItems.length, excludeProductId, limit]);

  return { recommendations, loading, error, refetch: generateRecommendations };
};
