import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Heart,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useOrders } from '../../hooks/useOrders';
import { useRecommendations } from '../../hooks/useRecommendations';
import { ProductGrid } from '../../components/product/ProductGrid';

export const UserDashboardPage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { totalItems } = useCart();
  const { wishlistIds, loading: wishlistLoading } = useWishlist();
  const { orders, loading: ordersLoading } = useOrders();
  const { recommendations: recommendedProducts, loading: productsLoading } = useRecommendations({ limit: 4 });

  const recentOrders = orders.slice(0, 3);

  if (authLoading || ordersLoading || wishlistLoading || productsLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-[#12372A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs text-[#66736A]">Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-[#12372A] text-white rounded-2xl p-6 sm:p-8 border border-[#1F6F50]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1F6F50] text-[#B7F34A] font-black text-2xl flex items-center justify-center shadow-xs shrink-0">
            {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Welcome back, {profile?.full_name || 'Valued Customer'}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-md bg-[#B7F34A] text-[#12372A] text-[10px] font-extrabold capitalize">
                {profile?.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs text-[#F7F4EA]/80 mt-1">{user?.email}</p>
          </div>
        </div>

        <Link
          to="/profile"
          className="px-4 py-2 rounded-xl bg-white text-[#12372A] hover:bg-[#F7F4EA] text-xs font-bold shadow-xs transition"
        >
          Edit Profile
        </Link>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 border border-[#DDE4DC] shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#F7F4EA] text-[#1F6F50] border border-[#DDE4DC]">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#66736A] font-semibold">Total Orders</span>
            <h3 className="text-2xl font-extrabold text-[#12372A]">{orders.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#DDE4DC] shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#F7F4EA] text-[#1F6F50] border border-[#DDE4DC]">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#66736A] font-semibold">Cart Items</span>
            <h3 className="text-2xl font-extrabold text-[#12372A]">{totalItems}</h3>
          </div>
        </div>

        <Link
          to="/wishlist"
          className="bg-white rounded-xl p-5 border border-[#DDE4DC] shadow-xs flex items-center gap-4 hover:border-[#1F6F50]/40 transition group"
        >
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 group-hover:scale-105 transition-transform">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#66736A] font-semibold">Saved Wishlist</span>
            <h3 className="text-2xl font-extrabold text-[#12372A]">{wishlistIds.length}</h3>
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl p-6 border border-[#DDE4DC] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#12372A]">Recent Orders</h2>
          <Link
            to="/orders"
            className="text-xs text-[#1F6F50] hover:underline font-bold flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-[#DDE4DC]">
            {recentOrders.map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#17211B]">
                    Order <span className="font-mono text-[#1F6F50]">#{order.id.slice(0, 8)}</span>
                  </p>
                  <p className="text-[#66736A] text-[11px]">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-[#12372A]">${order.total_amount.toFixed(2)}</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#F7F4EA] text-[#12372A] font-bold capitalize border border-[#DDE4DC] text-[10px]">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#66736A] py-4 italic text-center">
            No orders recorded yet. Visit the catalog to make your first purchase!
          </p>
        )}
      </div>

      {/* AI Personalized Recommendations Slot */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#1F6F50]" />
          <h2 className="text-lg font-bold text-[#12372A]">Recommended For You</h2>
        </div>
        <ProductGrid products={recommendedProducts} showAiBadge={true} />
      </div>
    </div>
  );
};
