import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountTotal,
    total,
  } = useCart();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-[#12372A]/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#DDE4DC] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#DDE4DC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#F7F4EA] text-[#12372A] border border-[#DDE4DC]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-[#12372A]">Your Shopping Cart</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#12372A] text-[#B7F34A] text-xs font-black">
                {items.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-[#66736A] hover:text-[#17211B] hover:bg-[#F7F4EA] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#F7F4EA] mx-auto flex items-center justify-center text-[#66736A] border border-[#DDE4DC]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-[#17211B]">Your cart is currently empty</h3>
                <p className="text-xs text-[#66736A] max-w-xs mx-auto">
                  Browse our catalog to discover AI recommended products.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/products');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white text-xs font-bold shadow transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
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
                    className="flex gap-4 p-3 rounded-xl bg-[#F7F4EA]/60 border border-[#DDE4DC]"
                  >
                    <img
                      src={
                        item.product.image_url ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={item.product.name}
                      className="w-16 h-16 rounded-lg object-cover bg-white shrink-0 border border-[#DDE4DC]"
                    />

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-xs font-bold text-[#17211B] truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-[#66736A]">{item.product.brand || 'ShopAI'}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-1.5 bg-white border border-[#DDE4DC] rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, safeQty - 1)}
                            className="p-1 text-[#66736A] hover:text-[#17211B] hover:bg-[#F7F4EA] rounded transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1.5 text-[#12372A]">
                            {safeQty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, safeQty + 1)}
                            className="p-1 text-[#66736A] hover:text-[#17211B] hover:bg-[#F7F4EA] rounded transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#12372A]">
                            ${itemTotal.toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1 text-[#66736A] hover:text-rose-600 transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-[#DDE4DC] bg-[#F7F4EA]/40 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#66736A]">
                  <span>Subtotal</span>
                  <span className="text-[#17211B] font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>Discounts</span>
                    <span>-${discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#66736A]">
                  <span>Estimated Shipping</span>
                  <span className="text-[#1F6F50] font-bold">Free</span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#12372A] pt-2 border-t border-[#DDE4DC]">
                  <span>Total</span>
                  <span className="text-[#12372A]">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#66736A]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F6F50]" />
                <span>Protected by 256-bit SSL encryption</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
