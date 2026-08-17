import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { AdminDashboardStats } from '../types';

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalCustomers: 0,
    pendingOrdersCount: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const fetchStats = useCallback(async () => {
    if (!configured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch Orders metrics
      const { data: orders, error: ordersErr } = await (supabase.from('orders') as any)
        .select('id, total_amount, status');

      if (ordersErr) throw ordersErr;

      const totalOrders = orders?.length || 0;
      const totalRevenue = (orders || []).reduce((acc: number, order: any) => {
        return order.status !== 'cancelled' ? acc + Number(order.total_amount) : acc;
      }, 0);
      const pendingOrdersCount = (orders || []).filter((o: any) => o.status === 'pending').length;

      // 2. Fetch Products count & low stock
      const { data: products, error: productsErr } = await (supabase.from('products') as any)
        .select('id, stock');

      if (productsErr) throw productsErr;

      const totalProducts = products?.length || 0;
      const lowStockCount = (products || []).filter((p: any) => p.stock <= 5).length;

      // 3. Fetch Categories count
      const { count: categoriesCount, error: catErr } = await (supabase.from('categories') as any)
        .select('*', { count: 'exact', head: true });

      if (catErr) throw catErr;

      // 4. Fetch Customers count
      const { count: customersCount, error: usersErr } = await (supabase.from('profiles') as any)
        .select('*', { count: 'exact', head: true });

      if (usersErr) throw usersErr;

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCategories: categoriesCount || 0,
        totalCustomers: customersCount || 0,
        pendingOrdersCount,
        lowStockCount,
      });
    } catch (err: any) {
      console.error('Error loading admin stats:', err);
      setError(err.message || 'Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};
