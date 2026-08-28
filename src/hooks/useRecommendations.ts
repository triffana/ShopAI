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

/**
 * Return true if the raw Supabase row looks like a valid Product record.
 * Guards against null / non-object rows that could cause downstream crashes.
 * products.id is always a UUID string — numeric IDs are never valid here.
 */
const isValidProductRow = (row: unknown): row is Product => {
  if (row == null || typeof row !== 'object') return false;
  const p = row as Record<string, unknown>;
  return typeof p.id === 'string' && p.id.length > 0 && typeof p.name === 'string';
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
   *
   * IMPORTANT: We do NOT order by review_count because that column may not
   * exist in all live Supabase deployments (causes HTTP 400 "column does not exist").
   * We rely on rating only, which is confirmed present in the schema.
   */
  const fetchFallbackProducts = useCallback(
    async (excludedSet: Set<string>, targetCount: number): Promise<Product[]> => {
      try {
        const { data, error: fetchErr } = await supabase
          .from('products')
          .select('*, categories(*)')
          .gt('stock', 0)
          .order('rating', { ascending: false, nullsFirst: false })
          .limit(targetCount * 3);

        if (fetchErr) {
          console.warn('[useRecommendations] Fallback fetch warning:', fetchErr.message);
          return [];
        }

        if (!Array.isArray(data)) return [];

        const filtered = data
          .filter(isValidProductRow)
          .filter((p) => !excludedSet.has(String(p.id)));

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

    // Build excluded products set (wishlist + cart + current product).
    // Use String() so any numeric IDs stored in localStorage are handled safely.
    const cartProductIds = cartItems
      .map((item) => (item?.product?.id != null ? String(item.product.id) : ''))
      .filter((id) => id.length > 0);

    const excludedSet = new Set<string>([
      ...wishlistIds.map((id) => (id != null ? String(id) : '')).filter((id) => id.length > 0),
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
      //
      // CRITICAL NOTE: user_interactions.product_id is a BIGINT column (stores
      // numeric IDs), while products.id is a UUID (string). These types are
      // incompatible for direct IN queries and cause HTTP 400 from PostgREST.
      // We do NOT attempt to JOIN or filter products by the bigint product_id.
      // Instead we use interaction TYPE frequency to derive scoring signals.
      const { data: interactions, error: intErr } = await supabase
        .from('user_interactions')
        .select('interaction_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (intErr) {
        console.warn('[useRecommendations] Failed to fetch user interactions:', intErr.message);
      }

      // 3. New users with 0 interactions -> Fallback
      if (!Array.isArray(interactions) || interactions.length === 0) {
        const fallback = await fetchFallbackProducts(excludedSet, limit);
        setRecommendations(fallback);
        setLoading(false);
        return;
      }

      // 4. Tally interaction type weights
      const typeWeightTally: Record<string, number> = {};
      interactions.forEach((interaction) => {
        const iType = String(interaction?.interaction_type || '');
        const weight = INTERACTION_WEIGHTS[iType] || 1;
        typeWeightTally[iType] = (typeWeightTally[iType] || 0) + weight;
      });

      const totalInteractionWeight = Object.values(typeWeightTally).reduce(
        (a, b) => a + b,
        0
      );

      // 5. Fetch in-stock candidate products from DB
      const { data: candidateProductsRaw, error: candErr } = await supabase
        .from('products')
        .select('*, categories(*)')
        .gt('stock', 0)
        .limit(100);

      if (candErr) {
        console.warn('[useRecommendations] Candidate products fetch error:', candErr.message);
        const fallback = await fetchFallbackProducts(excludedSet, limit);
        setRecommendations(fallback);
        setLoading(false);
        return;
      }

      if (!Array.isArray(candidateProductsRaw)) {
        const fallback = await fetchFallbackProducts(excludedSet, limit);
        setRecommendations(fallback);
        setLoading(false);
        return;
      }

      // Validate rows: must be non-null objects with a non-empty string id
      const candidateProducts = candidateProductsRaw.filter(isValidProductRow);

      // Filter out excluded products
      const availableCandidates = candidateProducts.filter(
        (p) => !excludedSet.has(String(p.id))
      );

      if (availableCandidates.length === 0) {
        const fallback = await fetchFallbackProducts(excludedSet, limit);
        setRecommendations(fallback);
        setLoading(false);
        return;
      }

      // 6. Multi-factor scoring algorithm
      const activityBonus = Math.min(totalInteractionWeight * 0.5, 20);

      const scoredCandidates = availableCandidates.map((product) => {
        let score = 0;

        // Rating quality score (max ~15 pts for 5-star)
        const rating = Number(product.rating) || 0;
        score += rating * 3;

        // review_count bonus — guard against missing column at runtime
        const rawReviewCount = (product as unknown as Record<string, unknown>).review_count;
        const reviewCount = rawReviewCount !== undefined ? Number(rawReviewCount) || 0 : 0;
        score += Math.min(reviewCount, 50) * 0.1;

        // Discount attractiveness bonus
        const discount = Number((product as any).discount_percent) || 0;
        if (discount > 0) score += Math.min(discount * 0.2, 5);

        // Activity bonus: tiebreaker for users with interaction history
        score += activityBonus / Math.max(availableCandidates.length, 1);

        return { product, score };
      });

      // Sort by score descending
      scoredCandidates.sort((a, b) => b.score - a.score);

      let finalRecs = scoredCandidates.map((sc) => sc.product).slice(0, limit);

      // If we don't have enough recommendations, backfill with top-rated products
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to calculate recommendations';
      console.error('[useRecommendations] Recommendation calculation failed:', err);
      setError(message);
      // Safe fallback on failure — Dashboard must never go blank
      try {
        const fallback = await fetchFallbackProducts(excludedSet, limit);
        setRecommendations(fallback);
      } catch (fallbackErr) {
        console.error('[useRecommendations] Fallback also failed:', fallbackErr);
        setRecommendations([]);
      }
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
