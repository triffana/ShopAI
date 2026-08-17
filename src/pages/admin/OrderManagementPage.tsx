import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Order, OrderStatus } from '../../types';

export const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await (supabase.from('orders') as any)
        .select('*, order_items(*, products(*)), profiles(full_name, email)')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as Order[]);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await (supabase.from('orders') as any)
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      await fetchAllOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6 pb-12 text-[#F7F4EA]">
      <div className="pb-4 border-b border-[#1F6F50]/30">
        <h1 className="text-2xl font-bold text-white tracking-tight">Order Management</h1>
        <p className="text-xs text-[#F7F4EA]/70 mt-1">Review & update order processing status</p>
      </div>

      <div className="bg-[#1F6F50]/10 rounded-xl border border-[#1F6F50]/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#F7F4EA]">
            <thead className="bg-[#12372A] text-[#B7F34A] font-bold border-b border-[#1F6F50]/40 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F6F50]/20">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#F7F4EA]/60">
                    Loading customer orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#F7F4EA]/70 italic">
                    No orders submitted yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#1F6F50]/20 transition">
                    <td className="p-4 font-mono text-[#B7F34A]">#{o.id.slice(0, 8)}</td>
                    <td className="p-4 font-bold text-white">
                      {(o.shipping_address as any)?.fullName || 'Guest Customer'}
                    </td>
                    <td className="p-4 font-extrabold text-[#B7F34A]">
                      ${Number(o.total_amount).toFixed(2)}
                    </td>
                    <td className="p-4 text-[#F7F4EA]/70">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-bold text-white">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                        className="px-2.5 py-1 bg-[#12372A] border border-[#1F6F50] rounded-lg text-xs text-white focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
