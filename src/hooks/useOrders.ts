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
    if (authLoading) return;
    setLoading(true);
    setError(null);
    if (!configured || !user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error: err } = await (supabase.from('orders') as any)
        .select('*, order_items(*, products(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;

      setOrders(data as Order[]);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch order history');
    } finally {
      setLoading(false);
    }
  }, [configured, user, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [authLoading, fetchOrders]);

  const createOrder = async (
    items: CartItem[],
    totalAmount: number,
    _shippingAddress?: ShippingAddress,
    _paymentMethod?: string
  ): Promise<{ orderId: string | null; error: Error | null }> => {
    if (!configured) {
      return {
        orderId: null,
        error: new Error('Supabase is not configured yet. Please set your credentials in .env'),
      };
    }

    try {
      // 1. Create order record using existing columns in active schema
      const orderPayload: Record<string, any> = {
        user_id: user?.id || null,
        total_amount: totalAmount,
        status: 'pending',
      };

      const { data: orderData, error: orderErr } = await (supabase.from('orders') as any)
        .insert(orderPayload)
        .select('id')
        .single();

      if (orderErr || !orderData) {
        throw orderErr || new Error('Failed to create order');
      }

      // 2. Create order items using existing columns in active schema
      const orderItems = items.map((item) => {
        const price = Number(item.product.price) || 0;
        const discount = Number(item.product.discount_percent) || 0;
        const finalPrice = price * (1 - discount / 100);

        return {
          order_id: (orderData as any).id,
          product_id: item.product.id,
          price: isNaN(finalPrice) ? 0 : finalPrice,
          quantity: item.quantity,
        };
      });

      const { error: itemsErr } = await (supabase.from('order_items') as any).insert(orderItems as any);

      if (itemsErr) {
        throw itemsErr;
      }

      await fetchOrders();
      return { orderId: (orderData as any).id, error: null };
    } catch (err: any) {
      console.error('Error creating order:', err);
      return { orderId: null, error: err };
    }
  };

  return { orders, loading, error, refetch: fetchOrders, createOrder };
};
