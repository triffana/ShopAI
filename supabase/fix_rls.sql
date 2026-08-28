-- =============================================================
-- ShopAI — RLS Fix Script
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================
-- 
-- WHAT THIS FIXES:
--   The existing INSERT policy on order_items used WITH CHECK (true),
--   which allows ANY authenticated (or even anonymous) user to insert
--   rows into order_items. This tightens it so a user can only insert
--   order_items that belong to an order they own.
--
-- NOTE: The primary checkout bug (missing product_name column) was a
--   frontend issue and has already been fixed in useOrders.ts.
--   The orders INSERT policy was correct — no changes needed there.
-- =============================================================

-- 1. Drop the overly-permissive order_items INSERT policy
DROP POLICY IF EXISTS "Users insert order items" ON public.order_items;

-- 2. Create a secure INSERT policy:
--    A user can insert an order_item only if the referenced order
--    belongs to them (auth.uid() = orders.user_id).
CREATE POLICY "Users insert own order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- 3. (Optional) Verify the active policies on order_items
--    Uncomment to inspect after running:
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'order_items';
