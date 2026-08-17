import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Category } from '../types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!configured) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (err) {
        throw err;
      }

      setCategories(data as Category[]);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
};
