import React from 'react';
import { Link } from 'react-router-dom';
import { PackageX, ShoppingBag, Heart, Database, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  type?: 'products' | 'cart' | 'wishlist' | 'orders' | 'supabase';
  title?: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'products',
  title,
  description,
  actionText,
  actionLink = '/products',
  onActionClick,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'cart':
        return <ShoppingBag className="w-12 h-12 text-indigo-400" />;
      case 'wishlist':
        return <Heart className="w-12 h-12 text-rose-400" />;
      case 'orders':
        return <PackageX className="w-12 h-12 text-sky-400" />;
      case 'supabase':
        return <Database className="w-12 h-12 text-amber-400" />;
      default:
        return <Sparkles className="w-12 h-12 text-indigo-400" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'cart':
        return 'Your Cart is Empty';
      case 'wishlist':
        return 'No Items Saved Yet';
      case 'orders':
        return 'No Orders Found';
      case 'supabase':
        return 'No Database Connection';
      default:
        return 'No Products Found';
    }
  };

  const getDefaultDescription = () => {
    switch (type) {
      case 'cart':
        return 'Explore our AI-curated catalog and discover great deals to fill your shopping bag.';
      case 'wishlist':
        return 'Save your favorite products to keep track of discounts and availability.';
      case 'orders':
        return 'You haven’t placed any orders yet. Start shopping to view order history here.';
      case 'supabase':
        return 'Your Supabase database table has not been initialized or has no items yet. Use the Admin panel or insert products into your database.';
      default:
        return 'We couldn’t find any items matching your filters or search criteria.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-card rounded-2xl border border-slate-800 my-6 max-w-lg mx-auto">
      <div className="p-4 rounded-2xl bg-slate-800/80 mb-4 border border-slate-700/60 shadow-lg">
        {getIcon()}
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-2">
        {title || getDefaultTitle()}
      </h3>

      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description || getDefaultDescription()}
      </p>

      {actionText && actionLink ? (
        <Link
          to={actionLink}
          onClick={onActionClick}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          {actionText}
        </Link>
      ) : (
        <Link
          to="/products"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          Browse Catalog
        </Link>
      )}
    </div>
  );
};
