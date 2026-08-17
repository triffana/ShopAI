import React from 'react';
import { Sparkles, Cpu, Zap, ArrowRight } from 'lucide-react';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Link } from 'react-router-dom';

interface RecommendationSectionProps {
  products: Product[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  products,
  loading = false,
  title = 'Picked For You',
  subtitle = 'Recommendations that get smarter with every interaction.',
}) => {
  const recommendedProducts = products.slice(0, 4);

  return (
    <section className="relative my-16 rounded-2xl p-6 sm:p-10 bg-[#12372A] text-[#F7F4EA] border border-[#1F6F50]/50 shadow-xl overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#1F6F50]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#B7F34A]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B7F34A]/20 text-[#B7F34A] text-xs font-bold border border-[#B7F34A]/30 mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Recommendation Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
            <Sparkles className="w-6 h-6 text-[#B7F34A]" />
          </h2>
          <p className="text-xs sm:text-sm text-[#F7F4EA]/80 mt-1 max-w-xl">{subtitle}</p>
        </div>

        <Link
          to="/products?sortBy=popular"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B7F34A] hover:underline transition group self-start md:self-auto"
        >
          <span>Explore All Recommendations</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="relative z-10">
          {/* Override skeleton colors for dark background */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/10 border border-white/10 rounded-xl p-4 animate-pulse h-72"
              >
                <div className="w-full h-36 bg-white/10 rounded-lg mb-4" />
                <div className="w-3/4 h-3 bg-white/10 rounded mb-2" />
                <div className="w-1/2 h-3 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : recommendedProducts.length > 0 ? (
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} showAiBadge={true} />
          ))}
        </div>
      ) : (
        <div className="relative z-10 bg-white/5 rounded-xl p-8 text-center max-w-lg mx-auto border border-[#1F6F50]">
          <div className="p-3 bg-[#B7F34A]/20 text-[#B7F34A] rounded-xl w-fit mx-auto mb-3 border border-[#B7F34A]/30">
            <Zap className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">AI Engine Standing By</h4>
          <p className="text-xs text-[#F7F4EA]/70 mt-1">
            Connect your Supabase dataset to automatically generate dynamic recommendation scores
            for catalog items.
          </p>
        </div>
      )}
    </section>
  );
};
