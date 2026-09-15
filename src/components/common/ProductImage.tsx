import React, { useState, useEffect } from 'react';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  category?: string | number | null;
  aspectRatio?: string;
}

const SVG_FALLBACK_PRODUCT = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23F7F4EA"/><g transform="translate(136, 136)" stroke="%2312372A" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></g><text x="200" y="320" font-family="sans-serif" font-size="20" font-weight="bold" fill="%2312372A" text-anchor="middle">ShopAI Product</text></svg>`;

const DEFAULT_FALLBACKS: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  '2': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
  '3': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  '4': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
  '5': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
  '6': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  fashion: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
  home: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
  sports: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
};

const GLOBAL_FALLBACK = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';

const getCategoryFallback = (cat?: string | number | null): string => {
  if (!cat) return GLOBAL_FALLBACK;
  const key = String(cat).trim().toLowerCase();
  return DEFAULT_FALLBACKS[key] || GLOBAL_FALLBACK;
};

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  category,
}) => {
  const [errorCount, setErrorCount] = useState(0);

  const getInitialSrc = () => {
    if (!src || typeof src !== 'string' || src.trim() === '') {
      return getCategoryFallback(category);
    }
    return src;
  };

  const [currentSrc, setCurrentSrc] = useState<string>(getInitialSrc());

  useEffect(() => {
    setErrorCount(0);
    if (!src || typeof src !== 'string' || src.trim() === '') {
      setCurrentSrc(getCategoryFallback(category));
    } else {
      setCurrentSrc(src);
    }
  }, [src, category]);

  const handleError = () => {
    if (errorCount === 0) {
      const catFallback = getCategoryFallback(category);
      setErrorCount(1);
      setCurrentSrc(catFallback !== currentSrc ? catFallback : GLOBAL_FALLBACK);
    } else if (errorCount === 1) {
      setErrorCount(2);
      setCurrentSrc(GLOBAL_FALLBACK);
    } else if (errorCount === 2) {
      setErrorCount(3);
      setCurrentSrc(SVG_FALLBACK_PRODUCT);
    } else {
      setErrorCount(4);
    }
  };

  if (errorCount >= 4) {
    return (
      <div className={`bg-gradient-to-br from-[#F7F4EA] to-[#DDE4DC] flex flex-col items-center justify-center p-3 text-center rounded-lg select-none ${className}`}>
        <div className="w-10 h-10 rounded-full bg-[#12372A]/10 flex items-center justify-center text-[#12372A] mb-1.5">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <span className="text-[11px] font-bold text-[#12372A] line-clamp-1">{alt || 'Product Item'}</span>
        <span className="text-[9px] text-[#66736A] font-semibold">ShopAI Guaranteed</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt || 'Product'}
      onError={handleError}
      className={className}
      loading="lazy"
    />
  );
};


