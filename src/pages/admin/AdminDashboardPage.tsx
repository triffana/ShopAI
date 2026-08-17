import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Package, FolderTree, Users, AlertCircle } from 'lucide-react';
import { useAdminStats } from '../../hooks/useAdminStats';

export const AdminDashboardPage: React.FC = () => {
  const { stats } = useAdminStats();

  return (
    <div className="space-y-8 pb-12">
      <div className="pb-4 border-b border-[#1F6F50]/30 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Overview</h1>
          <p className="text-xs text-[#F7F4EA]/70 mt-1">Real-time metrics from your Supabase backend</p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-[#1F6F50]/20 rounded-xl p-5 border border-[#1F6F50]/50 space-y-2">
          <div className="flex justify-between items-center text-[#B7F34A]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F7F4EA]/80">
              Total Revenue
            </span>
            <div className="p-2 bg-[#1F6F50]/40 rounded-xl border border-[#1F6F50]">
              <DollarSign className="w-5 h-5 text-[#B7F34A]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">
            ${stats.totalRevenue.toFixed(2)}
          </h2>
        </div>

        <div className="bg-[#1F6F50]/20 rounded-xl p-5 border border-[#1F6F50]/50 space-y-2">
          <div className="flex justify-between items-center text-[#B7F34A]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F7F4EA]/80">
              Total Orders
            </span>
            <div className="p-2 bg-[#1F6F50]/40 rounded-xl border border-[#1F6F50]">
              <ShoppingBag className="w-5 h-5 text-[#B7F34A]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">{stats.totalOrders}</h2>
        </div>

        <div className="bg-[#1F6F50]/20 rounded-xl p-5 border border-[#1F6F50]/50 space-y-2">
          <div className="flex justify-between items-center text-[#B7F34A]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F7F4EA]/80">
              Total Products
            </span>
            <div className="p-2 bg-[#1F6F50]/40 rounded-xl border border-[#1F6F50]">
              <Package className="w-5 h-5 text-[#B7F34A]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">{stats.totalProducts}</h2>
        </div>

        <div className="bg-[#1F6F50]/20 rounded-xl p-5 border border-[#1F6F50]/50 space-y-2">
          <div className="flex justify-between items-center text-[#B7F34A]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F7F4EA]/80">
              Categories
            </span>
            <div className="p-2 bg-[#1F6F50]/40 rounded-xl border border-[#1F6F50]">
              <FolderTree className="w-5 h-5 text-[#B7F34A]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">{stats.totalCategories}</h2>
        </div>

        <div className="bg-[#1F6F50]/20 rounded-xl p-5 border border-[#1F6F50]/50 space-y-2">
          <div className="flex justify-between items-center text-[#B7F34A]">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F7F4EA]/80">
              Total Users
            </span>
            <div className="p-2 bg-[#1F6F50]/40 rounded-xl border border-[#1F6F50]">
              <Users className="w-5 h-5 text-[#B7F34A]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">{stats.totalCustomers}</h2>
        </div>
      </div>

      {/* Quick Action Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400" />
            <div>
              <h4 className="text-xs font-bold text-white">Pending Orders</h4>
              <p className="text-xs text-[#F7F4EA]/70">
                {stats.pendingOrdersCount} orders waiting for shipment processing
              </p>
            </div>
          </div>
          <Link
            to="/admin/orders"
            className="px-3.5 py-1.5 rounded-lg bg-[#B7F34A] text-[#12372A] font-extrabold text-xs shadow transition shrink-0"
          >
            Manage Orders
          </Link>
        </div>

        <div className="bg-rose-500/10 rounded-xl p-5 border border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-400" />
            <div>
              <h4 className="text-xs font-bold text-white">Low Inventory Stock</h4>
              <p className="text-xs text-[#F7F4EA]/70">
                {stats.lowStockCount} products have 5 or fewer items remaining
              </p>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow transition shrink-0"
          >
            Update Inventory
          </Link>
        </div>
      </div>
    </div>
  );
};
