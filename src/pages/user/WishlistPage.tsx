import React from 'react';
import { Heart, ShoppingBag, AlertCircle } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { ProductCard } from '../../components/product/ProductCard';
import { Link } from 'react-router-dom';

export const WishlistPage: React.FC = () => {
  const { wishlistProducts, loading, error } = useWishlist();

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-[#12372A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs text-[#66736A]">Loading saved wishlist products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 max-w-md mx-auto">
        <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-rose-900 mb-1">Failed to load wishlist</h4>
            <p>{error}</p>
            <p className="mt-2 text-[#66736A]">Please refresh the page. If the problem persists, try signing out and signing in again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="pb-4 border-b border-[#DDE4DC] flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600" />
            Your Wishlist
          </h1>
          <p className="text-xs text-[#66736A] mt-1">
            {wishlistProducts.length > 0
              ? `You have ${wishlistProducts.length} saved product${wishlistProducts.length !== 1 ? 's' : ''}`
              : 'Save products here to buy them later'}
          </p>
        </div>

        <Link
          to="/products"
          className="px-4 py-2 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white text-xs font-bold shadow-xs transition"
        >
          Explore Catalog
        </Link>
      </div>

      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-xl border border-[#DDE4DC] shadow-xs max-w-md mx-auto p-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center border border-rose-100">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#12372A]">Your Wishlist is Empty</h3>
          <p className="text-xs text-[#66736A] max-w-xs mx-auto">
            Browse our catalog and click the heart icon on any item to save your favorite products.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white text-xs font-bold shadow transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Start Browsing</span>
          </Link>
        </div>
      )}
    </div>
  );
};
