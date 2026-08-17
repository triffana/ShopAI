import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, RotateCcw, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#12372A] border-t border-[#1F6F50]/40 text-[#F7F4EA] mt-20">
      {/* Value Proposition Highlights */}
      <div className="border-b border-[#1F6F50]/30 bg-[#12372A]/80">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-[#F7F4EA]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1F6F50]/30 text-[#B7F34A] border border-[#1F6F50]/50">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                AI Recommendation Engine
              </h4>
              <p className="text-xs text-[#F7F4EA]/70">Tailored shopping picks for you</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1F6F50]/30 text-[#B7F34A] border border-[#1F6F50]/50">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Fast Global Express
              </h4>
              <p className="text-xs text-[#F7F4EA]/70">Free shipping on orders over $50</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1F6F50]/30 text-[#B7F34A] border border-[#1F6F50]/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                100% Secure Checkout
              </h4>
              <p className="text-xs text-[#F7F4EA]/70">Powered by Supabase Security</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#1F6F50]/30 text-[#B7F34A] border border-[#1F6F50]/50">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Easy 30-Day Returns
              </h4>
              <p className="text-xs text-[#F7F4EA]/70">Hassle-free replacement policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="space-y-4 md:col-span-1">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1F6F50] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#B7F34A]" />
            </div>
            <span className="font-bold text-lg text-white">
              Shop<span className="text-[#B7F34A]">AI</span>
            </span>
          </Link>
          <p className="text-xs text-[#F7F4EA]/70 leading-relaxed">
            Next-generation smart e-commerce platform featuring AI recommendation algorithms, instant search, and real-time inventory management.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-[#B7F34A] uppercase tracking-wider">
            Explore Catalog
          </h5>
          <ul className="space-y-2 text-xs text-[#F7F4EA]/90">
            <li>
              <Link to="/products" className="hover:text-[#B7F34A] transition">
                All Products
              </Link>
            </li>
            <li>
              <Link to="/products?sortBy=popular" className="hover:text-[#B7F34A] transition">
                Popular Items
              </Link>
            </li>
            <li>
              <Link to="/products?sortBy=newest" className="hover:text-[#B7F34A] transition">
                New Arrivals
              </Link>
            </li>
          </ul>
        </div>

        {/* Account Links */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-[#B7F34A] uppercase tracking-wider">
            Customer Portal
          </h5>
          <ul className="space-y-2 text-xs text-[#F7F4EA]/90">
            <li>
              <Link to="/dashboard" className="hover:text-[#B7F34A] transition">
                User Dashboard
              </Link>
            </li>
            <li>
              <Link to="/track-order" className="hover:text-[#B7F34A] transition">
                Track Orders
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-[#B7F34A] transition">
                Shopping Cart
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-[#B7F34A] uppercase tracking-wider">
            Stay Connected
          </h5>
          <p className="text-xs text-[#F7F4EA]/70">
            Subscribe for AI personalized discounts & new release alerts.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 bg-[#1F6F50]/20 border border-[#1F6F50]/50 rounded-lg text-xs text-white placeholder-[#F7F4EA]/50 focus:outline-none focus:border-[#B7F34A]"
            />
            <button
              type="submit"
              className="w-full py-2 bg-[#B7F34A] hover:bg-[#a3e038] text-[#12372A] rounded-lg text-xs font-bold shadow transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-[#1F6F50]/30 py-6 text-center text-xs text-[#F7F4EA]/60">
        <p>© {new Date().getFullYear()} ShopAI Platform. Built with React, TypeScript & Supabase.</p>
      </div>
    </footer>
  );
};
