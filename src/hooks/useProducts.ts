import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Product, ProductFilterOptions } from '../types';
import { FALLBACK_PRODUCTS } from '../data/productsData';

export interface UseProductsOptions extends ProductFilterOptions {
  limit?: number;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
}

const FALLBACK_MAP = new Map(FALLBACK_PRODUCTS.map(p => [p.name.trim().toLowerCase(), p]));

const getCategoryFallbackUrl = (cat?: string | number | null): string => {
  const catKey = String(cat || '').trim().toLowerCase();
  const catMap: Record<string, string> = {
    '1': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    '2': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
    '3': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    '4': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    '5': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
    '6': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  };
  return catMap[catKey] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
};

const normalizeProduct = (p: any): Product => {
  if (!p) return p;
  const rawDiscount = p.discount !== undefined ? p.discount : p.discount_percent;
  const nameKey = (p.name || '').trim().toLowerCase();
  const fallback = FALLBACK_MAP.get(nameKey);

  // Replace invalid/broken image URLs with tested working Unsplash image URL
  let imgUrl = p.image_url;
  if (
    !imgUrl ||
    typeof imgUrl !== 'string' ||
    imgUrl.trim() === '' ||
    imgUrl.includes('1631214524020-7e18db7b0a5e') ||
    imgUrl.includes('1609592424925-6f6f1b6b2a8f')
  ) {
    imgUrl = fallback?.image_url || getCategoryFallbackUrl(p.category_id);
  }

  return {
    ...p,
    id: String(p.id),
    name: p.name || fallback?.name || 'Product',
    price: Number(p.price) || fallback?.price || 0,
    discount_percent: Number(rawDiscount) || fallback?.discount_percent || 0,
    rating: Number(p.rating) || fallback?.rating || 4.5,
    stock: Number(p.stock) || fallback?.stock || 0,
    brand: p.brand || fallback?.brand || 'ShopAI',
    category_id: p.category_id ? String(p.category_id) : (fallback?.category_id || null),
    image_url: imgUrl,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [imgUrl].filter(Boolean),
  };
};

export const useProducts = (options: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const configured = isSupabaseConfigured();

  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? options.limit ?? undefined;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    let dbProducts: Product[] = [];

    if (configured) {
      try {
        const { data } = await (supabase.from('products') as any).select('*, categories(*)');
        if (Array.isArray(data)) {
          dbProducts = data.map(normalizeProduct);
        }
      } catch (err: any) {
        console.warn('DB fetch error, falling back to local dataset:', err);
      }
    }

    // Merge DB products with FALLBACK_PRODUCTS to form full catalog of 126 products
    let combined = [...dbProducts];
    const dbNames = new Set(dbProducts.map(p => p.name.trim().toLowerCase()));

    FALLBACK_PRODUCTS.forEach(fp => {
      if (!dbNames.has(fp.name.trim().toLowerCase())) {
        combined.push(fp);
      }
    });

    // 1. Category Filter
    if (options.categoryId) {
      const catIdStr = String(options.categoryId).trim().toLowerCase();
      const catMap: Record<string, string> = {
        '1': 'electronics',
        '2': 'fashion',
        '3': 'shoes',
        '4': 'beauty',
        '5': 'home',
        '6': 'sports',
        electronics: '1',
        fashion: '2',
        shoes: '3',
        beauty: '4',
        home: '5',
        sports: '6',
      };

      combined = combined.filter(p => {
        if (!p.category_id && !p.category) return false;
        const pCatStr = String(p.category_id || p.category?.id || p.category?.name || '').trim().toLowerCase();
        if (pCatStr === catIdStr) return true;
        if (catMap[pCatStr] === catIdStr || catMap[catIdStr] === pCatStr) return true;
        if (pCatStr.includes(catIdStr) || catIdStr.includes(pCatStr)) return true;
        return false;
      });
    }

    // 2. Search Filter
    if (options.search && options.search.trim() !== '') {
      const s = options.search.trim().toLowerCase();
      combined = combined.filter(
        p =>
          p.name.toLowerCase().includes(s) ||
          (p.description && p.description.toLowerCase().includes(s)) ||
          (p.brand && p.brand.toLowerCase().includes(s)) ||
          (p.category?.name && p.category.name.toLowerCase().includes(s))
      );
    }

    // 3. Brand Filter
    if (options.brand && options.brand.trim() !== '') {
      const b = options.brand.trim().toLowerCase();
      combined = combined.filter(p => p.brand && p.brand.toLowerCase().includes(b));
    }

    // 4. Price Filters
    if (options.minPrice !== undefined && options.minPrice !== null && !isNaN(Number(options.minPrice))) {
      combined = combined.filter(p => p.price >= Number(options.minPrice));
    }

    if (options.maxPrice !== undefined && options.maxPrice !== null && !isNaN(Number(options.maxPrice))) {
      combined = combined.filter(p => p.price <= Number(options.maxPrice));
    }

    // 5. Rating Filter
    if (options.minRating !== undefined && !isNaN(Number(options.minRating))) {
      combined = combined.filter(p => p.rating >= Number(options.minRating));
    }

    // 6. In-Stock Filter
    if (options.inStockOnly) {
      combined = combined.filter(p => p.stock > 0);
    }

    // 7. Sorting
    switch (options.sortBy) {
      case 'price-asc':
        combined.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        combined.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
      case 'popular':
        combined.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        break;
    }

    const totalCount = combined.length;
    console.log("TOTAL PRODUCTS:", totalCount);

    let paginated = combined;

    if (pageSize !== undefined) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize;
      paginated = combined.slice(from, to);
    }

    setProducts(paginated);
    setTotal(totalCount);
    setLoading(false);
  }, [
    configured,
    options.categoryId,
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


export const useProductDetails = (idOrSlug: string | number | undefined) => {
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

    const strId = String(idOrSlug);

    // 1. Check local dataset
    const localMatch = FALLBACK_PRODUCTS.find(p => String(p.id) === strId || p.slug === strId);
    if (localMatch) {
      setProduct(localMatch);
      setLoading(false);
      return;
    }

    // 2. Query Supabase
    if (configured) {
      try {
        const { data } = await (supabase.from('products') as any)
          .select('*, categories(*)')
          .eq('id', idOrSlug)
          .maybeSingle();

        if (data) {
          setProduct(normalizeProduct(data));
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.warn('Error fetching product details from DB:', err);
      }
    }

    setProduct(null);
    setLoading(false);
  }, [idOrSlug, configured]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
};
