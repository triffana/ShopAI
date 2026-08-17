import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export const ProfilePage: React.FC = () => {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { wishlistProducts } = useWishlist();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.full_name !== undefined) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  if (authLoading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-4 border-[#12372A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs text-[#66736A]">Loading profile details...</span>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isSupabaseConfigured()) return;

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const { error } = await (supabase.from('profiles') as any).upsert({
        id: user.id,
        email: user.email || '',
        full_name: fullName.trim(),
        role: profile?.role || 'customer',
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      await refreshProfile();
      setSuccessMsg('Profile username updated successfully!');
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setErrorMsg(err.message || 'Failed to update username. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      <div className="pb-4 border-b border-[#DDE4DC]">
        <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight">Account Profile</h1>
        <p className="text-xs text-[#66736A] mt-1">Manage your personal settings and saved wishlist</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* User Card */}
        <div className="bg-white rounded-xl p-6 border border-[#DDE4DC] shadow-xs space-y-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#12372A] text-[#B7F34A] font-black text-3xl flex items-center justify-center mx-auto shadow-xs">
            {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#12372A]">{profile?.full_name || 'Customer'}</h3>
            <p className="text-xs text-[#66736A]">{user?.email}</p>
          </div>

          <div className="pt-3 border-t border-[#DDE4DC] flex justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#12372A] text-[#B7F34A] text-xs font-bold capitalize flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              {profile?.role || 'customer'}
            </span>
          </div>
        </div>

        {/* Update Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-[#DDE4DC] shadow-xs space-y-6">
          <h3 className="text-base font-bold text-[#12372A] flex items-center gap-2">
            <User className="w-5 h-5 text-[#1F6F50]" />
            <span>Personal Details</span>
          </h3>

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#1F6F50]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-[#F7F4EA] border border-[#DDE4DC] rounded-xl text-xs text-[#66736A] cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#DDE4DC]">
        <div className="p-5 rounded-xl bg-white border border-[#DDE4DC] shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#12372A]">Saved Wishlist</h4>
            <p className="text-[11px] text-[#66736A] mt-0.5">
              {wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} saved in your wishlist
            </p>
          </div>
          <Link
            to="/wishlist"
            className="px-3.5 py-1.5 rounded-lg bg-[#F7F4EA] hover:bg-[#DDE4DC]/60 text-[#12372A] text-xs font-bold transition"
          >
            View Wishlist
          </Link>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#DDE4DC] shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[#12372A]">Order History</h4>
            <p className="text-[11px] text-[#66736A] mt-0.5">
              Track and review your past order purchases
            </p>
          </div>
          <Link
            to="/orders"
            className="px-3.5 py-1.5 rounded-lg bg-[#F7F4EA] hover:bg-[#DDE4DC]/60 text-[#12372A] text-xs font-bold transition"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};
