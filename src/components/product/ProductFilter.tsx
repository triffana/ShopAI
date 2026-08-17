import React from 'react';
import { Filter, RotateCcw, Check, Star } from 'lucide-react';
import type { Category, ProductFilterOptions } from '../../types';

interface ProductFilterProps {
  categories: Category[];
  filters: ProductFilterOptions;
  onFilterChange: (updated: ProductFilterOptions) => void;
  onReset: () => void;
}

const RATING_OPTIONS = [
  { label: '4★ & above', value: 4 },
  { label: '3★ & above', value: 3 },
  { label: '2★ & above', value: 2 },
  { label: '1★ & above', value: 1 },
];

export const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  filters,
  onFilterChange,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-[#DDE4DC] shadow-xs space-y-6 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DDE4DC]">
        <h3 className="font-bold text-sm text-[#12372A] flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#1F6F50]" />
          Filter Products
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-[#66736A] hover:text-[#12372A] flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Sort Selector */}
      <div>
        <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy || 'newest'}
          onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
          className="w-full px-3 py-2 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] focus:outline-none focus:border-[#1F6F50] focus:ring-1 focus:ring-[#1F6F50]/20 transition"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {/* Categories Filter */}
      <div>
        <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-2">
          Categories
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
          <button
            onClick={() => onFilterChange({ ...filters, categoryId: undefined })}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              !filters.categoryId
                ? 'bg-[#12372A] text-[#B7F34A]'
                : 'text-[#17211B] hover:bg-[#F7F4EA] hover:text-[#12372A]'
            }`}
          >
            <span>All Categories</span>
            {!filters.categoryId && <Check className="w-3.5 h-3.5 text-[#B7F34A]" />}
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ ...filters, categoryId: cat.id })}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                filters.categoryId === cat.id
                  ? 'bg-[#12372A] text-[#B7F34A]'
                  : 'text-[#17211B] hover:bg-[#F7F4EA] hover:text-[#12372A]'
              }`}
            >
              <span>{cat.name}</span>
              {filters.categoryId === cat.id && <Check className="w-3.5 h-3.5 text-[#B7F34A]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-2">
          Price Range ($)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              const num = val !== '' ? Number(val) : undefined;
              onFilterChange({
                ...filters,
                minPrice: num !== undefined && !isNaN(num) ? num : undefined,
              });
            }}
            className="w-full px-3 py-1.5 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] placeholder-[#66736A] focus:outline-none focus:border-[#1F6F50] focus:ring-1 focus:ring-[#1F6F50]/20 transition"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              const num = val !== '' ? Number(val) : undefined;
              onFilterChange({
                ...filters,
                maxPrice: num !== undefined && !isNaN(num) ? num : undefined,
              });
            }}
            className="w-full px-3 py-1.5 bg-white border border-[#DDE4DC] rounded-xl text-xs text-[#17211B] placeholder-[#66736A] focus:outline-none focus:border-[#1F6F50] focus:ring-1 focus:ring-[#1F6F50]/20 transition"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-xs font-bold text-[#12372A] uppercase tracking-wider mb-2">
          Minimum Rating
        </label>
        <div className="space-y-1.5">
          <button
            onClick={() => onFilterChange({ ...filters, minRating: undefined })}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
              !filters.minRating
                ? 'bg-[#12372A] text-[#B7F34A]'
                : 'text-[#17211B] hover:bg-[#F7F4EA] hover:text-[#12372A]'
            }`}
          >
            <span>Any Rating</span>
            {!filters.minRating && <Check className="w-3.5 h-3.5 text-[#B7F34A]" />}
          </button>
          {RATING_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onFilterChange({ ...filters, minRating: value })}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                filters.minRating === value
                  ? 'bg-[#12372A] text-[#B7F34A]'
                  : 'text-[#17211B] hover:bg-[#F7F4EA] hover:text-[#12372A]'
              }`}
            >
              <span className="flex items-center gap-1">
                {Array.from({ length: value }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
                <span className="ml-1">{label}</span>
              </span>
              {filters.minRating === value && <Check className="w-3.5 h-3.5 text-[#B7F34A]" />}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="pt-2 border-t border-[#DDE4DC]">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-semibold text-[#17211B]">In Stock Only</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={!!filters.inStockOnly}
              onChange={(e) => onFilterChange({ ...filters, inStockOnly: e.target.checked })}
              className="sr-only"
              id="in-stock-toggle"
            />
            <div
              onClick={() => onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly })}
              className={`w-9 h-5 rounded-full cursor-pointer transition-colors ${
                filters.inStockOnly ? 'bg-[#12372A]' : 'bg-[#DDE4DC]'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  filters.inStockOnly ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};
