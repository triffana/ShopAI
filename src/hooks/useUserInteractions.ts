import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Interaction types that map exactly to the values stored in
 * public.user_interactions.interaction_type
 */
export type InteractionType =
  | 'product_view'
  | 'search'
  | 'add_to_cart'
  | 'wishlist'
  | 'category_view';

/**
 * useUserInteractions
 *
 * Provides a single `track` function that inserts a row into
 * public.user_interactions for the currently authenticated user.
 *
 * Schema (existing table, DO NOT modify):
 *   id            bigint  NOT NULL (auto)
 *   user_id       uuid    NOT NULL
 *   product_id    bigint  NOT NULL
 *   interaction_type text NOT NULL
 *   created_at    timestamptz nullable
 *
 * Rules:
 * - Never tracks anonymous (unauthenticated) users.
 * - Errors are logged but NEVER thrown — tracking must not break the main UI.
 * - Fire-and-forget: callers do NOT await the result.
 */
export const useUserInteractions = () => {
  const { user } = useAuth();
  const configured = isSupabaseConfigured();

  /**
   * Track an interaction.
   *
   * @param interactionType  One of the InteractionType values.
   * @param productId        Optional product ID (string or number). Defaults to 0 for
   *                         non-product interactions like 'search' or 'category_view'.
   */
  const track = useCallback(
    (interactionType: InteractionType, productId?: string | number): void => {
      // Guard: no tracking for unauthenticated users
      if (!user || !configured) return;

      // Coerce product_id to finite number; default to 0 for non-product events (search, category_view)
      const parsedId = productId !== undefined && productId !== null ? Number(productId) : 0;
      const numericProductId = Number.isFinite(parsedId) ? parsedId : 0;

      // Fire and forget — do not await
      (async () => {
        try {
          const { error } = await supabase.from('user_interactions').insert({
            user_id: user.id,
            product_id: numericProductId,
            interaction_type: interactionType,
            created_at: new Date().toISOString(),
          });

          if (error) {
            // Log but never surface to user
            console.warn(
              `[useUserInteractions] Failed to track "${interactionType}" for product ${productId ?? 0}:`,
              error.message
            );
          }
        } catch (err) {
          console.warn('[useUserInteractions] Unexpected tracking error:', err);
        }
      })();
    },
    [user, configured]
  );

  return { track };
};
