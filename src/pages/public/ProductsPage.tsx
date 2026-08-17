import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { ProductFilter } from '../../components/product/ProductFilter';
import { ProductGrid } from '../../components/product/ProductGrid';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import type { ProductFilterOptions } from '../../types';

const PAGE_SIZE = 12;

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategories();

  const parsePriceParam = (val: string | null): number | undefined => {
    if (!val || val.trim() === '') return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  };

  const [filters, setFilters] = useState<ProductFilterOptions>({
    categoryId: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    sortBy: (searchParams.get('sortBy') as any) || 'newest',
    minPrice: parsePriceParam(searchParams.get('minPrice')),
    maxPrice: parsePriceParam(searchParams.get('maxPrice')),
  });

  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Reset to page 1 whenever filters change from URL
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      categoryId: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || prev.sortBy || 'newest',
      minPrice: parsePriceParam(searchParams.get('minPrice')),
      maxPrice: parsePriceParam(searchParams.get('maxPrice')),
    }));
    setPage(1);
  }, [searchParams]);

  const { products, loading, error, total, refetch } = useProducts({
    ...filters,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleFilterChange = (updated: ProductFilterOptions) => {
    setFilters(updated);
    setPage(1);

    const params = new URLSearchParams();
    if (updated.categoryId) params.set('category', updated.categoryId);
    if (updated.search) params.set('search', updated.search);
    if (updated.sortBy) params.set('sortBy', updated.sortBy);
    if (updated.minPrice !== undefined && updated.minPrice !== null && !isNaN(Number(updated.minPrice))) {
      params.set('minPrice', String(updated.minPrice));
    }
    if (updated.maxPrice !== undefined && updated.maxPrice !== null && !isNaN(Number(updated.maxPrice))) {
      params.set('maxPrice', String(updated.maxPrice));
    }
    setSearchParams(params);
  };

  const handleReset = () => {
    const reset: ProductFilterOptions = { sortBy: 'newest' };
    setFilters(reset);
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCategoryName = categories.find((c) => c.id === filters.categoryId)?.name;

  // Visible page numbers
  const getPageNumbers = () => {
    const delta = 2;
    const range: (number | '...')[] = [];
    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift('...');
    if (page + delta < totalPages - 1) range.push('...');
    if (totalPages > 1) range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Catalog Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE4DC]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#12372A] tracking-tight flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-[#1F6F50]" />
            Product Catalog
          </h1>
          <p className="text-xs text-[#66736A] mt-0.5">
            {loading
              ? 'Loading products...'
              : `Showing ${products.length} of ${total} product${total !== 1 ? 's' : ''}${
                  activeCategoryName ? ` in "${activeCategoryName}"` : ''
                }${filters.search ? ` matching "${filters.search}"` : ''}`}
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#DDE4DC] text-[#12372A] text-xs font-bold shadow-xs self-start sm:self-auto transition hover:border-[#1F6F50]"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#1F6F50]" />
          <span>Filters & Sort</span>
        </button>
      </div>

      {/* Active Filter Chips */}
      {(filters.search ||
        filters.categoryId ||
        filters.inStockOnly ||
        filters.minPrice !== undefined ||
        filters.maxPrice !== undefined ||
        filters.minRating !== undefined) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#66736A] font-bold">Active Filters:</span>

          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#12372A] text-[#B7F34A] font-bold">
              <Search className="w-3 h-3" />
              <span>Search: "{filters.search}"</span>
              <button
                onClick={() => handleFilterChange({ ...filters, search: undefined })}
                className="hover:text-white ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.categoryId && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1F6F50] text-white font-bold">
              <span>Category: {activeCategoryName || filters.categoryId}</span>
              <button
                onClick={() => handleFilterChange({ ...filters, categoryId: undefined })}
                className="hover:text-[#B7F34A] ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.minRating !== undefined && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold border border-amber-200">
              <span>Rating: {filters.minRating}★ & above</span>
              <button
                onClick={() => handleFilterChange({ ...filters, minRating: undefined })}
                className="hover:text-amber-600 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7F4EA] text-[#12372A] font-bold border border-[#DDE4DC]">
              <span>
                Price: ${filters.minPrice ?? 0} – ${filters.maxPrice ?? '∞'}
              </span>
              <button
                onClick={() =>
                  handleFilterChange({ ...filters, minPrice: undefined, maxPrice: undefined })
                }
                className="hover:text-[#1F6F50] ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              <span>In Stock Only</span>
              <button
                onClick={() => handleFilterChange({ ...filters, inStockOnly: false })}
                className="hover:text-emerald-600 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={handleReset}
            className="text-[#1F6F50] hover:underline font-bold ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Filter & Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <ProductFilter
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        </div>

        {/* Mobile Filter Overlay */}
        {mobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-[#12372A]/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-xl border border-[#DDE4DC]">
              <h3 className="font-bold text-[#12372A] text-base">Filter Options</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 text-[#66736A] hover:text-[#17211B]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <ProductFilter
              categories={categories}
              filters={filters}
              onFilterChange={(updated) => {
                handleFilterChange(updated);
                setMobileFilterOpen(false);
              }}
              onReset={() => {
                handleReset();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        )}

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-8">
          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            onRetry={refetch}
          />

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {/* Prev */}
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-[#DDE4DC] text-xs font-bold text-[#12372A] hover:bg-[#F7F4EA] hover:text-[#1F6F50] disabled:opacity-50 disabled:bg-[#F7F4EA] disabled:text-[#66736A] disabled:border-[#DDE4DC] disabled:cursor-not-allowed transition shadow-xs"
              >
                <ChevronLeft className="w-4 h-4 text-current" />
                <span>Prev</span>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 py-1 text-xs text-[#66736A] font-bold">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p as number)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition shadow-xs ${
                        page === p
                          ? 'bg-[#12372A] text-[#B7F34A] border border-[#12372A]'
                          : 'bg-white border border-[#DDE4DC] text-[#17211B] hover:bg-[#F7F4EA] hover:text-[#1F6F50]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              {/* Next */}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-[#DDE4DC] text-xs font-bold text-[#12372A] hover:bg-[#F7F4EA] hover:text-[#1F6F50] disabled:opacity-50 disabled:bg-[#F7F4EA] disabled:text-[#66736A] disabled:border-[#DDE4DC] disabled:cursor-not-allowed transition shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 text-current" />
              </button>
            </div>
          )}

          {/* Page info */}
          {!loading && !error && total > 0 && (
            <p className="text-center text-[11px] text-[#66736A]">
              Page {page} of {totalPages} · {total} total products
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
