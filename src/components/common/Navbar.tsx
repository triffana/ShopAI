import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Sparkles,
  Menu,
  X,
  Shield,
  LogOut,
  LayoutDashboard,
  Package,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCategories } from '../../hooks/useCategories';
import { useUserInteractions } from '../../hooks/useUserInteractions';
import { SearchBar } from './SearchBar';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const { categories } = useCategories();
  const { track } = useUserInteractions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const trackCategory = () => {
    track('category_view');
  };

  const categoryRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#DDE4DC] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#12372A] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#B7F34A]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-[#12372A] flex items-center gap-1">
                Shop<span className="text-[#1F6F50] font-black">AI</span>
              </span>
            </div>
          </Link>

          {/* Desktop Category Navigation */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold">
            <Link
              to="/products"
              className={`transition ${
                location.pathname === '/products'
                  ? 'text-[#1F6F50] font-bold'
                  : 'text-[#17211B] hover:text-[#1F6F50]'
              }`}
            >
              All Products
            </Link>

            {/* Category Dropdown */}
            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-1 text-[#17211B] hover:text-[#1F6F50] transition"
              >
                <span>Categories</span>
                <ChevronDown className="w-4 h-4 text-[#66736A]" />
              </button>

              {categoryDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white border border-[#DDE4DC] rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/products?category=${cat.id}`}
                        onClick={() => {
                          setCategoryDropdownOpen(false);
                          trackCategory();
                        }}
                        className="block px-4 py-2 text-xs font-medium text-[#17211B] hover:bg-[#F7F4EA] hover:text-[#12372A] transition"
                      >
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-xs text-[#66736A] italic">
                      No categories yet
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md">
            <SearchBar />
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 text-[#12372A] hover:bg-[#F7F4EA] rounded-xl transition"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#12372A] text-[#B7F34A] text-[10px] font-bold flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#12372A] hover:bg-[#F7F4EA] rounded-xl transition"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#B7F34A] text-[#12372A] text-xs font-black flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account / Auth Menu */}
            <div className="relative ml-1" ref={userRef}>
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-[#F7F4EA] hover:bg-[#DDE4DC]/60 border border-[#DDE4DC] text-[#12372A] transition"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#12372A] text-[#B7F34A] font-bold flex items-center justify-center text-xs">
                      {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold max-w-[100px] truncate">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#66736A]" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-[#DDE4DC] rounded-xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#DDE4DC]">
                        <p className="text-xs font-bold text-[#12372A] truncate">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-[11px] text-[#66736A] truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#17211B] hover:bg-[#F7F4EA] hover:text-[#12372A]"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#1F6F50]" />
                        User Dashboard
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#17211B] hover:bg-[#F7F4EA] hover:text-[#12372A]"
                      >
                        <Package className="w-4 h-4 text-[#1F6F50]" />
                        My Orders
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#17211B] hover:bg-[#F7F4EA] hover:text-[#12372A]"
                      >
                        <User className="w-4 h-4 text-[#1F6F50]" />
                        Profile Settings
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#12372A] bg-[#B7F34A]/20 hover:bg-[#B7F34A]/30"
                        >
                          <Shield className="w-4 h-4 text-[#12372A]" />
                          Admin Console
                        </Link>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left border-t border-[#DDE4DC] mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#12372A] hover:text-[#1F6F50] transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#12372A] hover:bg-[#1F6F50] rounded-xl shadow-xs transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#12372A] hover:bg-[#F7F4EA] rounded-xl transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Row */}
        <div className="md:hidden py-2 border-t border-[#DDE4DC]">
          <SearchBar />
        </div>
      </div>

      {/* Mobile Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#DDE4DC] px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-[#12372A] hover:text-[#1F6F50]"
          >
            All Products
          </Link>
          <div className="py-2 border-t border-[#DDE4DC]">
            <span className="text-xs uppercase tracking-wider font-bold text-[#66736A]">
              Categories
            </span>
            <div className="mt-2 space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    trackCategory();
                  }}
                  className="block py-1 text-sm text-[#17211B] hover:text-[#1F6F50]"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          {user && (
            <div className="pt-2 border-t border-[#DDE4DC] space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-sm font-medium text-[#17211B]"
              >
                Dashboard
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-sm font-medium text-[#17211B]"
              >
                My Orders
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 text-sm text-[#12372A] font-bold"
                >
                  Admin Console
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
