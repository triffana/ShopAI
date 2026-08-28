import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, CheckCircle, AlertCircle, PackageX, Sparkles, Tag } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useUserInteractions } from '../../hooks/useUserInteractions';

interface ProductCardProps {
  product: Product;
  showAiBadge?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showAiBadge = false }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { track } = useUserInteractions();

  const productIdStr = String(product?.id ?? '');
  const isWishlisted = isInWishlist(productIdStr);

  const rawPrice = Number(product?.price);
  const originalPrice = isNaN(rawPrice) ? 0 : rawPrice;
  const rawDiscount = Number(product?.discount_percent);
  const discountPercent = isNaN(rawDiscount) ? 0 : rawDiscount;
  const finalPrice = discountPercent > 0 ? originalPrice * (1 - discountPercent / 100) : originalPrice;

  const stockNum = Number(product?.stock ?? 0);
  const isOut = stockNum <= 0;
  const isLow = stockNum > 0 && stockNum <= 5;

  const getStockBadge = () => {
    if (isOut) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
          <PackageX className="w-3 h-3" />
          Out of Stock
        </span>
      );
    }
    if (isLow) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
          <AlertCircle className="w-3 h-3" />
          Only {stockNum} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
        <CheckCircle className="w-3 h-3" />
        In Stock
      </span>
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOut) {
      addToCart(product, 1);
      track('add_to_cart', productIdStr);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    track('wishlist', productIdStr);
  };

  const displayImage =
    product.image_url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  const categoryName = product.category?.name;

  return (
    <div className="bg-white border border-[#DDE4DC] rounded-xl p-4 flex flex-col justify-between group relative overflow-hidden shadow-xs hover:-translate-y-1 hover:shadow-lg hover:shadow-[#12372A]/10 hover:border-[#1F6F50]/40 transition-all duration-200">
      {/* Top Badges */}
      <div className="flex items-center justify-between z-10 mb-2">
        <div className="flex items-center gap-1.5">
          {discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-[#B7F34A] text-[#12372A] font-extrabold text-[11px] shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {showAiBadge && (
            <span className="px-2 py-0.5 rounded-md bg-[#12372A] text-[#B7F34A] font-bold text-[10px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#B7F34A]" />
              AI Match
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`p-2 rounded-xl border transition-all ${
            isWishlisted
              ? 'bg-rose-50 border-rose-200 text-rose-600'
              : 'bg-white border-[#DDE4DC] text-[#66736A] hover:text-rose-600 hover:bg-rose-50'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>
      </div>

      {/* Image & Product Link */}
      <Link to={`/product/${productIdStr}`} className="block group">
        <div className="w-full h-48 rounded-lg overflow-hidden bg-[#F7F4EA] flex items-center justify-center relative mb-3">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Category chip */}
        {categoryName && (
          <div className="mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F7F4EA] text-[#1F6F50] text-[10px] font-semibold border border-[#DDE4DC]">
              <Tag className="w-2.5 h-2.5" />
              {categoryName}
            </span>
          </div>
        )}

        {/* Brand & Stock */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[11px] font-bold text-[#1F6F50] uppercase tracking-wider truncate max-w-[120px]">
            {product.brand || 'ShopAI Store'}
          </span>
          {getStockBadge()}
        </div>

        {/* Product Title */}
        <h3 className="font-bold text-sm text-[#17211B] group-hover:text-[#1F6F50] transition-colors line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Star Rating */}
        <div className="flex items-center gap-1 mt-2">
          <div className="flex items-center text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
          </div>
          <span className="text-xs font-bold text-[#17211B]">
            {Number(product.rating || 4.5).toFixed(1)}
          </span>
          <span className="text-[11px] text-[#66736A]">
            ({(product as Record<string, any>)?.review_count ?? 12})
          </span>
        </div>
      </Link>

      {/* Card Footer: Price & Add to Cart */}
      <div className="mt-4 pt-3 border-t border-[#DDE4DC] flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-[#12372A]">
              ${finalPrice.toFixed(2)}
            </span>
            {discountPercent > 0 && (
              <span className="text-xs text-[#66736A] line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOut}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
            isOut
              ? 'bg-[#DDE4DC] text-[#66736A] cursor-not-allowed'
              : 'bg-[#12372A] hover:bg-[#1F6F50] text-white active:scale-95'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isOut ? 'Sold Out' : 'Add'}</span>
        </button>
      </div>
    </div>
  );
};
