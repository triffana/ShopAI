import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import type { ShippingAddress } from '../../types';

export const CheckoutPage: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { createOrder } = useOrders();
  const navigate = useNavigate();

  const [address, setAddress] = useState<ShippingAddress>({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    address: '124 Tech Boulevard, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    country: 'United States',
    phone: '+1 (555) 019-2834',
  });

  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-xl border border-[#DDE4DC] my-8 shadow-xs max-w-lg mx-auto p-6">
        <h2 className="text-xl font-bold text-[#12372A] mb-2">No Items to Checkout</h2>
        <p className="text-xs text-[#66736A] mb-4">Add products to your cart before proceeding.</p>
        <button
          onClick={() => navigate('/products')}
          className="px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white text-xs font-bold shadow"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg(null);
    setSubmitting(true);

    const { error } = await createOrder(items, total, address, paymentMethod);

    if (error) {
      setSubmitting(false);
      setErrorMsg(error.message || 'Failed to place order. Please check connection or Supabase setup.');
    } else {
      clearCart();
      navigate('/orders');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="pb-4 border-b border-[#DDE4DC]">
        <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight">Checkout</h1>
        <p className="text-xs text-[#66736A] mt-1">Complete shipping and payment details</p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-[#DDE4DC] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#12372A] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#1F6F50]" />
              <span>Shipping Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#12372A] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] focus:border-[#1F6F50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12372A] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={address.email}
                  onChange={(e) => setAddress({ ...address, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] focus:border-[#1F6F50]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#12372A] mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address.address}
                  onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] focus:border-[#1F6F50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12372A] mb-1">City</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] focus:border-[#1F6F50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12372A] mb-1">State / Province</label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] focus:border-[#1F6F50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12372A] mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] focus:border-[#1F6F50]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12372A] mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] focus:border-[#1F6F50]"
                />
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white rounded-xl p-6 border border-[#DDE4DC] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#12372A] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#1F6F50]" />
              <span>Payment Options</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                  paymentMethod === 'credit_card'
                    ? 'bg-[#12372A] text-white border-[#12372A]'
                    : 'bg-white border-[#DDE4DC] text-[#17211B] hover:bg-[#F7F4EA]'
                }`}
              >
                <span>Credit / Debit Card</span>
                {paymentMethod === 'credit_card' && <CheckCircle2 className="w-4 h-4 text-[#B7F34A]" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                  paymentMethod === 'paypal'
                    ? 'bg-[#12372A] text-white border-[#12372A]'
                    : 'bg-white border-[#DDE4DC] text-[#17211B] hover:bg-[#F7F4EA]'
                }`}
              >
                <span>PayPal</span>
                {paymentMethod === 'paypal' && <CheckCircle2 className="w-4 h-4 text-[#B7F34A]" />}
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'bg-[#12372A] text-white border-[#12372A]'
                    : 'bg-white border-[#DDE4DC] text-[#17211B] hover:bg-[#F7F4EA]'
                }`}
              >
                <span>Cash on Delivery</span>
                {paymentMethod === 'cash_on_delivery' && <CheckCircle2 className="w-4 h-4 text-[#B7F34A]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Order Review Sidebar */}
        <div className="bg-white rounded-xl p-6 border border-[#DDE4DC] shadow-xs space-y-6">
          <h3 className="text-base font-bold text-[#12372A] border-b border-[#DDE4DC] pb-3">
            Review Order
          </h3>

          <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between text-xs">
                <div className="truncate max-w-[180px]">
                  <p className="font-bold text-[#17211B] truncate">{item.product.name}</p>
                  <p className="text-[11px] text-[#66736A]">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-[#12372A]">
                  ${(item.product.price * (1 - item.product.discount_percent / 100) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#DDE4DC] space-y-2 text-xs">
            <div className="flex justify-between text-[#66736A]">
              <span>Shipping</span>
              <span className="text-[#1F6F50] font-bold">Free Express</span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#12372A] pt-2 border-t border-[#DDE4DC]">
              <span>Total Payment</span>
              <span className="text-[#12372A]">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98] disabled:opacity-50"
          >
            <span>{submitting ? 'Placing Order...' : 'Place Order'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
