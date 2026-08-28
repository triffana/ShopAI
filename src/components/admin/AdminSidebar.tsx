import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';
import { Logo } from '../common/Logo';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[#12372A] border-r border-[#1F6F50]/40 text-[#F7F4EA] flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        {/* Admin Header */}
        <div className="p-6 border-b border-[#1F6F50]/30">
          <div className="flex items-center justify-between">
            <Logo variant="dark" />
            <span className="text-[9px] font-extrabold bg-[#B7F34A] text-[#12372A] px-2 py-0.5 rounded uppercase">
              Admin
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-[#1F6F50] text-white border border-[#B7F34A]/40 shadow-xs'
                    : 'text-[#F7F4EA]/70 hover:bg-[#1F6F50]/30 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#B7F34A]' : 'text-[#F7F4EA]/60'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Link */}
      <div className="p-4 border-t border-[#1F6F50]/30">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-[#1F6F50]/40 hover:bg-[#1F6F50] text-white text-xs font-bold border border-[#1F6F50]/50 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Store Front</span>
        </Link>
      </div>
    </aside>
  );
};
