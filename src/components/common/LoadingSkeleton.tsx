import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-[#DDE4DC] rounded-xl p-4 flex flex-col justify-between animate-pulse shadow-xs">
      <div>
        {/* Top badges */}
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-4 bg-[#DDE4DC] rounded-md" />
          <div className="w-8 h-8 bg-[#DDE4DC] rounded-xl" />
        </div>
        {/* Image placeholder */}
        <div className="w-full h-48 bg-[#F0EDE0] rounded-lg mb-4" />
        {/* Brand + stock */}
        <div className="flex items-center justify-between mb-1">
          <div className="w-16 h-3 bg-[#DDE4DC] rounded" />
          <div className="w-16 h-4 bg-[#DDE4DC] rounded-md" />
        </div>
        {/* Name */}
        <div className="w-full h-4 bg-[#DDE4DC] rounded mb-1" />
        <div className="w-3/4 h-4 bg-[#DDE4DC] rounded mb-3" />
        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-3.5 bg-[#DDE4DC] rounded-full" />
          <div className="w-8 h-3 bg-[#DDE4DC] rounded" />
          <div className="w-10 h-3 bg-[#DDE4DC] rounded" />
        </div>
      </div>
      {/* Footer: price + add to cart */}
      <div className="mt-4 pt-3 border-t border-[#DDE4DC] flex items-center justify-between gap-2">
        <div className="w-20 h-6 bg-[#DDE4DC] rounded" />
        <div className="w-16 h-8 bg-[#DDE4DC] rounded-xl" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Back button */}
      <div className="w-32 h-4 bg-[#DDE4DC] rounded" />
      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="w-full h-96 bg-[#F0EDE0] rounded-2xl" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-20 h-20 bg-[#DDE4DC] rounded-xl" />
            ))}
          </div>
        </div>
        {/* Info */}
        <div className="space-y-4">
          <div className="w-24 h-3 bg-[#DDE4DC] rounded" />
          <div className="w-3/4 h-8 bg-[#DDE4DC] rounded" />
          <div className="w-full h-4 bg-[#DDE4DC] rounded" />
          <div className="w-1/2 h-12 bg-[#DDE4DC] rounded-2xl" />
          <div className="w-full h-20 bg-[#DDE4DC] rounded-xl" />
          <div className="flex gap-3">
            <div className="flex-1 h-12 bg-[#DDE4DC] rounded-xl" />
            <div className="flex-1 h-12 bg-[#DDE4DC] rounded-xl" />
            <div className="w-12 h-12 bg-[#DDE4DC] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
