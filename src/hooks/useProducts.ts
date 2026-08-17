import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Product, ProductFilterOptions } from '../types';

export interface UseProductsOptions extends ProductFilterOptions {
  limit?: number;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const configured = isSupabaseConfigured();

  // Derive effective pagination params
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? options.limit ?? undefined;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!configured) {
      setLoading(false);
      return;
    }

    try {
      let query = (supabase.from('products') as any).select('*, categories(*)', {
        count: 'exact',
      });

      if (options.categoryId) {
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          options.categoryId
        );
        if (isUuid) {
          query = query.eq('category_id', options.categoryId);
        } else {
          try {
            const { data: catData } = await (supabase.from('categories') as any)
              .select('id')
              .or(`slug.eq.${options.categoryId},name.ilike.${options.categoryId}`)
              .maybeSingle();
            if (catData?.id) {
              query = query.eq('category_id', catData.id);
            } else {
              query = query.eq('category_id', options.categoryId);
            }
          } catch (e) {
            query = query.eq('category_id', options.categoryId);
          }
        }
      }

      if (options.isFeatured !== undefined) {
        query = query.eq('is_featured', options.isFeatured);
      }

      if (options.search) {
        query = query.or(
          `name.ilike.%${options.search}%,description.ilike.%${options.search}%,brand.ilike.%${options.search}%`
        );
      }

      if (options.brand) {
        query = query.ilike('brand', `%${options.brand}%`);
      }

      if (options.minPrice !== undefined && options.minPrice !== null && options.minPrice !== ('' as any)) {
        const minVal = Number(options.minPrice);
        if (!isNaN(minVal)) {
          query = query.gte('price', minVal);
        }
      }

      if (options.maxPrice !== undefined && options.maxPrice !== null && options.maxPrice !== ('' as any)) {
        const maxVal = Number(options.maxPrice);
        if (!isNaN(maxVal)) {
          query = query.lte('price', maxVal);
        }
      }

      if (options.minRating !== undefined) {
        query = query.gte('rating', options.minRating);
      }

      if (options.inStockOnly) {
        query = query.gt('stock', 0);
      }

      // Sorting
      switch (options.sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false, nullsFirst: false });
          break;
        case 'popular':
          query = query
            .order('review_count', { ascending: false, nullsFirst: false })
            .order('rating', { ascending: false, nullsFirst: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Pagination or simple limit
      if (pageSize !== undefined) {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
      }

      let { data, error: err, count } = await query;

      if (err && options.sortBy === 'popular') {
        console.warn('Popular sort query warning, attempting fallback query:', err.message);
        let fallbackQuery = (supabase.from('products') as any)
          .select('*, categories(*)', { count: 'exact' })
          .order('rating', { ascending: false });

        if (options.categoryId) {
          fallbackQuery = fallbackQuery.eq('category_id', options.categoryId);
        }
        if (pageSize !== undefined) {
          const from = (page - 1) * pageSize;
          const to = from + pageSize - 1;
          fallbackQuery = fallbackQuery.range(from, to);
        }
        const fallbackRes = await fallbackQuery;
        if (!fallbackRes.error) {
          data = fallbackRes.data;
          count = fallbackRes.count;
          err = null;
        }
      }

      if (err) throw err;

      setProducts(data as Product[]);
      setTotal(count ?? 0);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [
    configured,
    options.categoryId,
    options.isFeatured,
    options.search,
    options.brand,
    options.minPrice,
    options.maxPrice,
    options.minRating,
    options.inStockOnly,
    options.sortBy,
    options.limit,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, total, refetch: fetchProducts };
};

export const useProductDetails = (idOrSlug: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const fetchProduct = useCallback(async () => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    if (!configured) {
      setLoading(false);
      return;
    }

    try {
      let { data, error: err } = await (supabase.from('products') as any)
        .select('*, categories(*)')
        .eq('id', idOrSlug)
        .maybeSingle();

      if (!data) {
        const { data: slugData, error: slugErr } = await (supabase.from('products') as any)
          .select('*, categories(*)')
          .eq('slug', idOrSlug)
          .maybeSingle();

        if (slugErr) throw slugErr;
        data = slugData;
      }

      if (err && !data) throw err;

      setProduct((data as unknown as Product) || null);
    } catch (err: any) {
      console.error('Error fetching product details:', err);
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [idOrSlug, configured]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
};
