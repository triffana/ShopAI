import React, { useState, useEffect, useCallback } from 'react';
import { Database, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Category } from '../../types';

export const SupabaseConnectionTest: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const configured = isSupabaseConfigured();

  const testConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!configured) {
      setLoading(false);
      setError('VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is not defined in environment variables.');
      return;
    }

    try {
      const { data, error: queryError } = await (supabase.from('categories') as any)
        .select('*');

      if (queryError) {
        throw new Error(queryError.message || 'Failed to read from public.categories');
      }

      setCategories(data as Category[]);
      setSuccess(true);
    } catch (err: any) {
      console.error('Supabase connection test error:', err);
      setError(err.message || 'Connection failed when reading from public.categories.');
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  return (
    <div className="w-full bg-white border-b border-[#DDE4DC] px-4 py-2.5 text-xs text-[#17211B]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#F7F4EA] border border-[#DDE4DC] text-[#12372A] shrink-0">
            <Database className="w-4 h-4" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#12372A]">Supabase Connection Test:</span>
              <code className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7F4EA] text-[#1F6F50] font-mono font-semibold border border-[#DDE4DC]">
                public.categories
              </code>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center gap-2 text-[#1F6F50] font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1F6F50]" />
                <span>Reading data from public.categories table...</span>
              </div>
            )}

            {/* Success State */}
            {!loading && success && (
              <div className="flex flex-wrap items-center gap-2 text-[#1F6F50] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#1F6F50]" />
                <span>
                  Connected successfully! Loaded {categories.length} categories from Supabase.
                </span>
                {categories.length > 0 && (
                  <div className="flex items-center gap-1.5 ml-1">
                    {categories.slice(0, 4).map((cat) => (
                      <span
                        key={cat.id}
                        className="px-2 py-0.5 rounded bg-[#12372A] text-[#B7F34A] text-[10px] font-bold"
                      >
                        {cat.name}
                      </span>
                    ))}
                    {categories.length > 4 && (
                      <span className="text-[10px] text-[#66736A]">+{categories.length - 4} more</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="flex items-center gap-2 text-rose-600 font-semibold">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Connection Error: {error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Retry Action */}
        <button
          onClick={testConnection}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F7F4EA] hover:bg-[#DDE4DC]/60 text-[#12372A] text-xs font-bold border border-[#DDE4DC] transition disabled:opacity-50 shrink-0 self-end md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Retest Connection</span>
        </button>
      </div>
    </div>
  );
};
