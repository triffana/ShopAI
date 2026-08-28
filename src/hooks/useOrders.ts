import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Order, ShippingAddress, CartItem } from '../types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const configured = isSupabaseConfigured();

  const fetchOrders = useCallback(async () => {
    // BUG FIX #3: When authLoading is true, exit early but MUST still set
    // loading=false so the UI doesn't spin forever on the /orders page.
    if (authLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (!configured || !user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: err } = await (supabase.from('orders') as any)
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;

      setOrders((data ?? []) as Order[]);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch order history');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [configured, user, authLoading]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const createOrder = async (
    items: CartItem[],
    totalAmount: number,
    shippingAddress?: ShippingAddress,
    paymentMethod?: string
  ): Promise<{ orderId: string | null; error: Error | null }> => {
    if (!configured) {
      return {
        orderId: null,
        error: new Error('Supabase is not configured yet. Please set your credentials in .env'),
      };
    }

    if (!user) {
      return {
        orderId: null,
        error: new Error('You must be logged in to place an order.'),
      };
    }

    let createdOrderId: string | null = null;

    try {
      // ── Step 1: Create the order row ──────────────────────────────────────
      // BUG FIX #2: Include shipping_address and payment_method in the payload.
      // The schema columns have defaults but we should always persist the real values.
      const orderPayload: Record<string, unknown> = {
        user_id: user.id,            // never null — user is guaranteed above
        total_amount: totalAmount,
        status: 'pending',
        shipping_address: shippingAddress ?? {},
        payment_method: paymentMethod ?? 'credit_card',
      };

      const { data: orderData, error: orderErr } = await (supabase.from('orders') as any)
        .insert(orderPayload)
        .select('id')
        .single();

      if (orderErr || !orderData) {
        throw orderErr ?? new Error('Failed to create order');
      }

      createdOrderId = (orderData as { id: string }).id;

      // ── Step 2: Insert order_items ─────────────────────────────────────────
      // BUG FIX #1: Include product_name (NOT NULL column) in every item payload.
      const orderItems = items.map((item) => {
        const price = Number(item.product.price) || 0;
        const discount = Number(item.product.discount_percent) || 0;
        const finalPrice = price * (1 - discount / 100);

        return {
          order_id: createdOrderId,
          product_id: item.product.id,
          product_name: item.product.name,          // ← was missing, caused NOT NULL violation
          price: isNaN(finalPrice) ? price : finalPrice,
          quantity: item.quantity,
        };
      });

      const { error: itemsErr } = await (supabase.from('order_items') as any)
        .insert(orderItems as any);

      if (itemsErr) {
        // BUG FIX #4: Roll back the orphaned order row so the DB stays clean.
        console.error('order_items insert failed — rolling back order:', itemsErr);
        await (supabase.from('orders') as any).delete().eq('id', createdOrderId);
        createdOrderId = null;
        throw itemsErr;
      }

      // ── Step 3: Refresh orders list ───────────────────────────────────────
      await fetchOrders();
      return { orderId: createdOrderId, error: null };
    } catch (err: any) {
      console.error('Error creating order:', err);
      return { orderId: null, error: err instanceof Error ? err : new Error(err?.message ?? 'Unknown error') };
    }
  };

  return { orders, loading, error, refetch: fetchOrders, createOrder };
};
