import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Search,
  AlertCircle,
  ArrowLeft,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Order } from '../../types';

export const TrackOrderPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading } = useOrders();
  const { id: pathOrderId } = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchId, setSearchId] = useState(pathOrderId || searchParams.get('id') || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrderDetails = async (orderIdToFetch: string) => {
    if (!user || !orderIdToFetch.trim() || !isSupabaseConfigured()) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // Security check: Query order belonging strictly to authenticated user
      const { data, error } = await (supabase.from('orders') as any)
        .select('*, order_items(*, products(*))')
        .eq('id', orderIdToFetch.trim())
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        setSelectedOrder(null);
        setErrorMsg('Order not found or you do not have permission to view this order.');
      } else {
        setSelectedOrder(data as Order);
      }
    } catch (err: any) {
      console.error('Error fetching order for tracking:', err);
      setErrorMsg(err.message || 'Failed to retrieve tracking details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const targetId = pathOrderId || searchParams.get('id');
    if (targetId) {
      setSearchId(targetId);
      fetchOrderDetails(targetId);
    } else if (orders.length > 0) {
      // Default to most recent order if available
      setSelectedOrder(orders[0]);
      setSearchId(orders[0].id);
    }
  }, [pathOrderId, searchParams, orders, user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setSearchParams({ id: searchId.trim() });
      fetchOrderDetails(searchId.trim());
    }
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setSearchId(order.id);
    setSearchParams({ id: order.id });
  };

  const getStatusStepIndex = (status: string) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      case 'cancelled':
        return 0;
      default:
        return 1;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
            <Truck className="w-3.5 h-3.5" />
            Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200">
            <Clock className="w-3.5 h-3.5" />
            Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending Confirmation
          </span>
        );
    }
  };

  if (authLoading || ordersLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-[#12372A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs text-[#66736A]">Loading tracking portal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header Bar */}
      <div className="pb-4 border-b border-[#DDE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#1F6F50]" />
            Order Tracking
          </h1>
          <p className="text-xs text-[#66736A] mt-1">
            Check live fulfillment status and order history breakdown
          </p>
        </div>

        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#DDE4DC] text-[#12372A] text-xs font-bold hover:bg-[#F7F4EA] transition self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Orders</span>
        </Link>
      </div>

      {/* Search & Select Form */}
      <div className="bg-white rounded-xl p-5 border border-[#DDE4DC] shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#66736A] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Order UUID (e.g. 550e8400-e29b-41d4-a716-446655440000)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] focus:border-[#1F6F50]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white text-xs font-bold shadow-xs transition shrink-0"
          >
            Track Order
          </button>
        </form>

        {/* Quick Order Picker */}
        {orders.length > 0 && (
          <div className="pt-3 border-t border-[#DDE4DC] flex items-center gap-2 overflow-x-auto custom-scrollbar">
            <span className="text-[11px] font-bold text-[#66736A] shrink-0">Your Recent Orders:</span>
            {orders.slice(0, 5).map((ord) => (
              <button
                key={ord.id}
                onClick={() => handleSelectOrder(ord)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border shrink-0 transition ${
                  selectedOrder?.id === ord.id
                    ? 'bg-[#12372A] text-[#B7F34A] border-[#12372A]'
                    : 'bg-[#F7F4EA] text-[#17211B] border-[#DDE4DC] hover:bg-[#DDE4DC]/60'
                }`}
              >
                #{String(ord.id ?? '').slice(0, 8)} (${Number(ord.total_amount).toFixed(2)})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center bg-white rounded-xl border border-[#DDE4DC] shadow-xs">
          <div className="w-8 h-8 border-4 border-[#12372A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs text-[#66736A]">Retrieving order tracking details...</span>
        </div>
      )}

      {/* Error state */}
      {errorMsg && !loading && (
        <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-rose-900 mb-1">Tracking Information Unavailable</h4>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Selected Order Display */}
      {selectedOrder && !loading && (
        <div className="space-y-6">
          {/* Order Banner */}
          <div className="bg-white rounded-xl p-6 border border-[#DDE4DC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-black text-[#12372A]">
                  Order <span className="font-mono text-[#1F6F50]">#{selectedOrder.id}</span>
                </h2>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-[#66736A] flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#1F6F50]" />
                  Placed {new Date(selectedOrder.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1 font-bold text-[#12372A]">
                  <DollarSign className="w-3.5 h-3.5 text-[#1F6F50]" />
                  Total: ${Number(selectedOrder.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Progress Stepper */}
          {selectedOrder.status !== 'cancelled' ? (
            <div className="bg-white rounded-xl p-6 border border-[#DDE4DC] shadow-xs space-y-6">
              <h3 className="text-sm font-bold text-[#12372A] uppercase tracking-wider">
                Progress Status
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { step: 1, label: 'Order Placed', desc: 'Order received in system' },
                  { step: 2, label: 'Processing', desc: 'Preparing item package' },
                  { step: 3, label: 'Shipped', desc: 'In transit with carrier' },
                  { step: 4, label: 'Delivered', desc: 'Package delivered' },
                ].map(({ step, label, desc }) => {
                  const currentStep = getStatusStepIndex(selectedOrder.status);
                  const isCompleted = step <= currentStep;
                  const isCurrent = step === currentStep;

                  return (
                    <div
                      key={step}
                      className={`p-4 rounded-xl border transition ${
                        isCurrent
                          ? 'bg-[#12372A] text-white border-[#12372A] shadow-xs'
                          : isCompleted
                          ? 'bg-[#F7F4EA] text-[#12372A] border-[#1F6F50]/40'
                          : 'bg-white text-[#66736A] border-[#DDE4DC] opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          Step 0{step}
                        </span>
                        {isCompleted && (
                          <CheckCircle2
                            className={`w-4 h-4 ${isCurrent ? 'text-[#B7F34A]' : 'text-[#1F6F50]'}`}
                          />
                        )}
                      </div>
                      <h4 className="text-xs font-bold mb-1">{label}</h4>
                      <p className="text-[11px] opacity-80">{desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <h4 className="font-bold text-sm mb-1 text-rose-900">Order Cancelled</h4>
              <p>This order has been cancelled. If you have questions, please contact support.</p>
            </div>
          )}

          {/* Purchased Items Breakdown */}
          <div className="bg-white rounded-xl p-6 border border-[#DDE4DC] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#12372A] uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-[#1F6F50]" />
              Item Summary
            </h3>

            <div className="divide-y divide-[#DDE4DC] text-xs">
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                selectedOrder.order_items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#17211B]">
                        {item.product_name || (item as any).products?.name || 'Product Item'}
                      </p>
                      <p className="text-[11px] text-[#66736A]">Quantity: {item.quantity}</p>
                    </div>
                    <span className="font-extrabold text-[#12372A]">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-3 text-[#66736A] italic">No items listed for this order.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State when no orders exist at all */}
      {!selectedOrder && !loading && !errorMsg && orders.length === 0 && (
        <div className="py-16 text-center bg-white rounded-xl border border-[#DDE4DC] shadow-xs max-w-md mx-auto p-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F7F4EA] text-[#12372A] mx-auto flex items-center justify-center border border-[#DDE4DC]">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#12372A]">No Orders Placed Yet</h3>
          <p className="text-xs text-[#66736A]">
            You have not placed any orders. Discover our AI recommendations to place your first order.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white text-xs font-bold shadow transition"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};
