import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { useOrders } from '../../hooks/useOrders';
import { useNavigate } from 'react-router-dom';

export const OrdersPage: React.FC = () => {
  const { orders, loading, error, refetch } = useOrders();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
            <Truck className="w-3.5 h-3.5" />
            Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200">
            <Clock className="w-3.5 h-3.5" />
            Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-[#12372A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs text-[#66736A]">Loading your order history...</span>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="py-12 flex flex-col items-center gap-4 max-w-md mx-auto text-center">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#12372A] mb-1">Failed to Load Orders</h3>
          <p className="text-xs text-[#66736A] leading-relaxed">{error}</p>
        </div>
        <button
          id="orders-retry-btn"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white text-xs font-bold shadow transition active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center gap-5 text-center">
        <div className="p-5 rounded-2xl bg-[#F7F4EA] border border-[#DDE4DC]">
          <ShoppingBag className="w-12 h-12 text-[#66736A]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#12372A] mb-1">No Orders Yet</h3>
          <p className="text-xs text-[#66736A]">You haven't placed any orders. Start shopping to see your history here.</p>
        </div>
        <button
          id="orders-shop-now-btn"
          onClick={() => navigate('/products')}
          className="px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white text-xs font-bold shadow transition active:scale-[0.98]"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  // ── Orders list ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-16">
      <div className="pb-4 border-b border-[#DDE4DC] flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight">Order History</h1>
          <p className="text-xs text-[#66736A] mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''} placed
          </p>
        </div>
        <button
          id="orders-refresh-btn"
          onClick={() => refetch()}
          title="Refresh orders"
          className="p-2 rounded-lg border border-[#DDE4DC] hover:bg-[#F7F4EA] text-[#66736A] transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-[#DDE4DC] overflow-hidden shadow-xs transition"
            >
              {/* Order Row Header */}
              <div
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#F7F4EA]/60 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#F7F4EA] text-[#12372A] border border-[#DDE4DC]">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#12372A]">
                        Order #{String(order.id ?? '').slice(0, 8).toUpperCase()}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-[#66736A] mt-1">
                      Placed on {new Date(order.created_at).toLocaleDateString()} at{' '}
                      {new Date(order.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-[#DDE4DC] pt-3 sm:pt-0">
                  <div className="text-right">
                    <span className="text-xs text-[#66736A] block">Total Amount</span>
                    <span className="text-base font-extrabold text-[#12372A]">
                      ${Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-[#66736A]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#66736A]" />
                  )}
                </div>
              </div>

              {/* Order Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-3 border-t border-[#DDE4DC] bg-[#F7F4EA]/40 space-y-4 text-xs">
                  <h4 className="font-bold text-[#12372A]">Purchased Items</h4>
                  <div className="divide-y divide-[#DDE4DC]">
                    {order.order_items && order.order_items.length > 0 ? (
                      order.order_items.map((item) => (
                        <div key={item.id} className="py-2.5 flex justify-between items-center">
                          <div>
                            <p className="font-bold text-[#17211B]">
                              {item.product_name || 'Product Item'}
                            </p>
                            <p className="text-[11px] text-[#66736A]">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-[#12372A]">
                            ${(Number(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#66736A] py-2 italic">No item breakdown available.</p>
                    )}
                  </div>

                  {/* Shipping Address */}
                  {(() => {
                    const addr = order.shipping_address as any;
                    if (!addr || !addr.fullName) return null;
                    return (
                      <div className="pt-3 border-t border-[#DDE4DC] text-[#66736A]">
                        <span className="font-bold text-[#12372A] block mb-1">Shipping Address:</span>
                        <p>
                          {addr.fullName} —{' '}
                          {addr.address},{' '}
                          {addr.city},{' '}
                          {addr.state}{' '}
                          {addr.postalCode}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Payment Method */}
                  {order.payment_method && (
                    <div className="pt-1 text-[#66736A]">
                      <span className="font-bold text-[#12372A]">Payment: </span>
                      {order.payment_method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
