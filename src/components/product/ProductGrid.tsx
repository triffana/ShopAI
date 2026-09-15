import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  showAiBadge?: boolean;
  onRetry?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  error = null,
  emptyTitle,
  emptyDescription,
  showAiBadge = false,
  onRetry,
}) => {
  if (loading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border border-rose-100 text-center space-y-4">
        <div className="p-3 bg-rose-50 text-rose-500 rounded-xl border border-rose-100">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#12372A] mb-1">Failed to Load Products</h3>
          <p className="text-xs text-[#66736A] max-w-sm">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white text-xs font-bold shadow-xs transition active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  const validProducts = Array.isArray(products)
    ? products.filter((p) => p && typeof p === 'object' && p.id != null)
    : [];

  if (validProducts.length === 0) {
    return (
      <EmptyState
        type="products"
        title={emptyTitle || 'No Products Available'}
        description={
          emptyDescription ||
          'Check back soon or try adjusting your search filters. If you are the store owner, insert items into Supabase.'
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-6">
      {validProducts.map((product) => (
        <ProductCard key={String(product.id)} product={product} showAiBadge={showAiBadge} />
      ))}
    </div>
  );
};
