import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { EmptyState } from '../../components/common/EmptyState';

export const CartPage: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountTotal,
    total,
  } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="py-12">
        <EmptyState type="cart" actionText="Browse Catalog" actionLink="/products" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="pb-4 border-b border-[#DDE4DC]">
        <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight">Shopping Cart</h1>
        <p className="text-xs text-[#66736A] mt-1">Review your selected items before checkout</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const rawPrice = Number(item?.product?.price);
            const price = isNaN(rawPrice) ? 0 : rawPrice;
            const rawDiscount = Number(item?.product?.discount_percent);
            const discount = isNaN(rawDiscount) ? 0 : rawDiscount;
            const itemPrice = price * (1 - discount / 100);
            const safeQty = Number(item?.quantity) || 1;
            const itemTotal = isNaN(itemPrice * safeQty) ? 0 : itemPrice * safeQty;

            return (
              <div
                key={item.product.id}
                className="bg-white rounded-xl p-4 border border-[#DDE4DC] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={
                      item.product.image_url ||
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
                    }
                    alt={item.product.name}
                    className="w-20 h-20 rounded-lg object-cover bg-[#F7F4EA] border border-[#DDE4DC] shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#17211B]">{item.product.name}</h3>
                    <p className="text-xs text-[#66736A]">{item.product.brand || 'ShopAI'}</p>
                    <span className="text-xs font-black text-[#12372A] mt-1 block">
                      ${itemPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[#DDE4DC]">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-[#F7F4EA] border border-[#DDE4DC] rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, safeQty - 1)}
                      className="p-1 text-[#66736A] hover:text-[#17211B] rounded-lg hover:bg-white transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold px-2 text-[#12372A]">{safeQty}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, safeQty + 1)}
                      className="p-1 text-[#66736A] hover:text-[#17211B] rounded-lg hover:bg-white transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <span className="text-sm font-black text-[#12372A] block">
                      ${itemTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-[#66736A] hover:text-rose-600 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-xl p-6 border border-[#DDE4DC] shadow-xs space-y-6">
          <h3 className="text-base font-bold text-[#12372A] border-b border-[#DDE4DC] pb-3">
            Order Summary
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[#66736A]">
              <span>Subtotal</span>
              <span className="text-[#17211B] font-bold">${subtotal.toFixed(2)}</span>
            </div>
            {discountTotal > 0 && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Discounts</span>
                <span>-${discountTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#66736A]">
              <span>Shipping</span>
              <span className="text-[#1F6F50] font-bold">Free Express</span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#12372A] pt-3 border-t border-[#DDE4DC]">
              <span>Total Amount</span>
              <span className="text-[#12372A]">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98]"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
