import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  Cpu,
  ShieldCheck,
  Zap,
  Star,
  Award,
  Package,
  Users,
} from 'lucide-react';
import { SearchBar } from '../../components/common/SearchBar';
import { ProductGrid } from '../../components/product/ProductGrid';
import { RecommendationSection } from '../../components/product/RecommendationSection';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useRecommendations } from '../../hooks/useRecommendations';
import { ProductImage } from '../../components/common/ProductImage';

// Category icons mapped by common category names (case-insensitive fallback)
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  electronics: <Zap className="w-6 h-6" />,
  fashion: <ShoppingBag className="w-6 h-6" />,
  home: <Package className="w-6 h-6" />,
  accessories: <Star className="w-6 h-6" />,
  gadgets: <Cpu className="w-6 h-6" />,
  fitness: <TrendingUp className="w-6 h-6" />,
  books: <Package className="w-6 h-6" />,
  beauty: <Sparkles className="w-6 h-6" />,
  sports: <TrendingUp className="w-6 h-6" />,
  toys: <Sparkles className="w-6 h-6" />,
};

const getCategoryIcon = (name: string) => {
  const key = name.toLowerCase().split(' ')[0];
  return CATEGORY_ICONS[key] || <ShoppingBag className="w-6 h-6" />;
};

export const LandingPage: React.FC = () => {
  // Trending: newest products
  const { products: trendingProducts, loading: trendingLoading } = useProducts({
    sortBy: 'newest',
    pageSize: 8,
  });

  // Best Sellers: most popular (by review_count)
  const { products: bestSellers, loading: bestSellersLoading } = useProducts({
    sortBy: 'popular',
    pageSize: 4,
  });

  // AI Recommended: personalized based on user interaction history and preferences
  const { recommendations: recommendedProducts, loading: recommendedLoading } = useRecommendations({
    limit: 4,
  });

  const { categories } = useCategories();

  return (
    <div className="space-y-16 pb-12">
      {/* ─── Hero Section ─────────────────────────────────────── */}
      <section className="relative rounded-2xl overflow-hidden mt-2 bg-white border border-[#DDE4DC] shadow-sm">
        {/* Subtle background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F7F4EA] via-white to-[#eef7ec] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B7F34A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1F6F50]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center p-8 sm:p-12">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1F6F50]/10 text-[#12372A] text-xs font-bold border border-[#1F6F50]/20">
              <Sparkles className="w-4 h-4 text-[#1F6F50]" />
              <span>AI-Powered Shopping</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-[#12372A] tracking-tight leading-none">
              Smart Shopping. <br />
              <span className="text-[#1F6F50]">Powered by AI.</span>
            </h1>

            <p className="text-[#66736A] text-base sm:text-lg leading-relaxed max-w-lg">
              Discover products that match your style, needs and preferences — curated in real-time
              by our AI recommendation engine.
            </p>

            {/* Search Input Bar */}
            <div className="max-w-md pt-1">
              <SearchBar placeholder="Search products, brands, categories..." />
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/products"
                className="px-6 py-3 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white text-sm font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Products</span>
              </Link>

              <Link
                to="/products?sortBy=popular"
                className="px-6 py-3 rounded-xl bg-white border border-[#12372A] text-[#12372A] hover:bg-[#F7F4EA] text-sm font-bold transition"
              >
                <span>AI Recommendations</span>
              </Link>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap gap-6 pt-2 border-t border-[#DDE4DC]">
              {[
                { icon: <Package className="w-4 h-4 text-[#1F6F50]" />, label: 'Products', value: '10,000+' },
                { icon: <Users className="w-4 h-4 text-[#1F6F50]" />, label: 'Customers', value: '50K+' },
                { icon: <Award className="w-4 h-4 text-amber-500" />, label: 'Reviews', value: '4.9★' },
                { icon: <ShieldCheck className="w-4 h-4 text-[#1F6F50]" />, label: 'Secure', value: '100%' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  {icon}
                  <div>
                    <div className="text-sm font-black text-[#12372A]">{value}</div>
                    <div className="text-[10px] text-[#66736A] font-medium">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Abstract AI Visual */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="absolute w-72 h-72 bg-[#1F6F50]/10 rounded-full blur-3xl" />
            <div className="relative w-full max-w-sm space-y-4">
              {/* Floating Product Sample Card 1 */}
              <div className="bg-white border border-[#DDE4DC] rounded-xl p-4 shadow-md flex items-center gap-4 relative z-20 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="w-14 h-14 rounded-lg bg-[#F7F4EA] border border-[#DDE4DC] flex items-center justify-center text-[#12372A] font-bold shrink-0">
                  <Cpu className="w-7 h-7 text-[#12372A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#1F6F50] uppercase tracking-wider">
                      Neural Match
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#B7F34A] text-[#12372A] text-[10px] font-extrabold">
                      98% Match
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#17211B] truncate mt-0.5">
                    Smart Noise-Cancelling Headphones
                  </h4>
                  <span className="text-xs font-black text-[#12372A]">$199.99</span>
                </div>
              </div>

              {/* Connecting AI Node Graphic */}
              <div className="flex justify-center items-center gap-2 py-1">
                <div className="w-2 h-2 rounded-full bg-[#12372A]" />
                <div className="h-0.5 w-16 bg-gradient-to-r from-[#12372A] via-[#1F6F50] to-[#B7F34A]" />
                <div className="p-1 rounded-full bg-[#B7F34A] text-[#12372A]">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="h-0.5 w-16 bg-gradient-to-r from-[#B7F34A] via-[#1F6F50] to-[#12372A]" />
                <div className="w-2 h-2 rounded-full bg-[#12372A]" />
              </div>

              {/* Floating Product Sample Card 2 */}
              <div className="bg-[#12372A] text-white rounded-xl p-4 shadow-lg flex items-center gap-4 relative z-10 border border-[#1F6F50]/50 ml-4">
                <div className="w-14 h-14 rounded-lg bg-[#1F6F50]/40 flex items-center justify-center text-[#B7F34A] shrink-0">
                  <Zap className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#B7F34A] uppercase tracking-wider">
                      AI Pick
                    </span>
                    <span className="text-[10px] font-semibold text-white/80">Personalized</span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate mt-0.5">
                    Ergonomic Leather Chair
                  </h4>
                  <span className="text-xs font-black text-[#B7F34A]">$249.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Categories ───────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#12372A] tracking-tight">
              Featured Categories
            </h2>
            <p className="text-xs text-[#66736A] mt-0.5">Browse by department</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-[#12372A] hover:text-[#1F6F50] flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.length > 0 ? (
            categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="bg-white border border-[#DDE4DC] rounded-xl p-4 text-center group flex flex-col items-center justify-center hover:bg-[#12372A] hover:border-[#12372A] transition-all duration-200 shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F7F4EA] text-[#12372A] flex items-center justify-center mb-3 group-hover:bg-[#1F6F50] group-hover:text-[#B7F34A] transition-colors">
                  {getCategoryIcon(cat.name)}
                </div>
                <h4 className="text-xs font-bold text-[#17211B] group-hover:text-[#F7F4EA] transition-colors">
                  {cat.name}
                </h4>
              </Link>
            ))
          ) : (
            ['Electronics', 'Fashion', 'Home & Living', 'Accessories', 'Gadgets', 'Fitness'].map(
              (name, idx) => (
                <Link
                  key={idx}
                  to="/products"
                  className="bg-white border border-[#DDE4DC] rounded-xl p-4 text-center group flex flex-col items-center justify-center hover:bg-[#12372A] hover:border-[#12372A] transition-all duration-200 shadow-xs"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F7F4EA] text-[#12372A] flex items-center justify-center mb-3 group-hover:bg-[#1F6F50] group-hover:text-[#B7F34A] transition-colors">
                    {getCategoryIcon(name)}
                  </div>
                  <h4 className="text-xs font-bold text-[#17211B] group-hover:text-[#F7F4EA] transition-colors">
                    {name}
                  </h4>
                </Link>
              )
            )
          )}
        </div>
      </section>

      {/* ─── Trending Products ─────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#12372A] tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1F6F50]" />
              Trending Products
            </h2>
            <p className="text-xs text-[#66736A] mt-0.5">Freshest items from our inventory</p>
          </div>
          <Link
            to="/products?sortBy=newest"
            className="text-xs font-bold text-[#12372A] hover:text-[#1F6F50] flex items-center gap-1 transition"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid products={trendingProducts} loading={trendingLoading} />
      </section>

      {/* ─── AI Recommendation Section ─────────────────────────── */}
      <RecommendationSection
        products={recommendedProducts}
        loading={recommendedLoading}
        title="Picked For You"
        subtitle="Curated in real-time by our AI engine based on your browsing patterns and activity."
      />

      {/* ─── Best Sellers ──────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#12372A] tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Best Sellers
            </h2>
            <p className="text-xs text-[#66736A] mt-0.5">Most loved by our community</p>
          </div>
          <Link
            to="/products?sortBy=popular"
            className="text-xs font-bold text-[#12372A] hover:text-[#1F6F50] flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Best Sellers in a highlighted 2-col layout on desktop */}
        {bestSellersLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#DDE4DC] rounded-xl p-4 animate-pulse h-72"
              >
                <div className="w-full h-40 bg-[#F0EDE0] rounded-lg mb-4" />
                <div className="w-3/4 h-4 bg-[#DDE4DC] rounded mb-2" />
                <div className="w-1/2 h-3 bg-[#DDE4DC] rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product, index) => {
              const originalPrice = Number(product.price);
              const discountPercent = Number(product.discount_percent || 0);
              const finalPrice =
                discountPercent > 0
                  ? originalPrice * (1 - discountPercent / 100)
                  : originalPrice;

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group bg-white border border-[#DDE4DC] rounded-xl overflow-hidden shadow-xs hover:-translate-y-1 hover:shadow-lg hover:shadow-[#12372A]/10 hover:border-[#1F6F50]/40 transition-all duration-200"
                >
                  {/* Rank badge */}
                  <div className="relative">
                    <div className="w-full h-44 bg-[#F7F4EA] overflow-hidden">
                      <ProductImage
                        src={product.image_url}
                        alt={product.name}
                        category={product.category_id}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-[#12372A] text-[#B7F34A] font-black text-xs flex items-center justify-center shadow">
                      #{index + 1}
                    </div>
                    {discountPercent > 0 && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-[#B7F34A] text-[#12372A] font-extrabold text-[10px] shadow">
                        -{discountPercent}%
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <span className="text-[10px] font-bold text-[#1F6F50] uppercase tracking-wider">
                      {product.brand || 'ShopAI Store'}
                    </span>
                    <h3 className="text-sm font-bold text-[#17211B] group-hover:text-[#1F6F50] transition-colors line-clamp-2 mt-0.5 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-bold text-[#17211B]">
                        {Number(product.rating || 4.5).toFixed(1)}
                      </span>
                      <span className="text-[11px] text-[#66736A]">
                        ({product.review_count || 0})
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-base font-black text-[#12372A]">
                        ${finalPrice.toFixed(2)}
                      </span>
                      {discountPercent > 0 && (
                        <span className="text-xs text-[#66736A] line-through">
                          ${originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── Value Propositions Banner ─────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: <Cpu className="w-6 h-6 text-[#B7F34A]" />,
            title: 'AI Recommendations',
            desc: 'Tailored shopping picks for you',
          },
          {
            icon: <ShieldCheck className="w-6 h-6 text-[#B7F34A]" />,
            title: '100% Secure Checkout',
            desc: 'Powered by Supabase security',
          },
          {
            icon: <ShoppingBag className="w-6 h-6 text-[#B7F34A]" />,
            title: 'Fast Express Delivery',
            desc: 'Free shipping on orders over $50',
          },
          {
            icon: <Zap className="w-6 h-6 text-[#B7F34A]" />,
            title: 'Easy 30-Day Returns',
            desc: 'Hassle-free replacement policy',
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="flex items-center gap-4 p-5 rounded-xl bg-[#12372A] border border-[#1F6F50]/50 shadow-xs"
          >
            <div className="p-2.5 rounded-xl bg-[#1F6F50]/30 border border-[#1F6F50]/50 shrink-0">
              {icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{title}</h4>
              <p className="text-[11px] text-[#F7F4EA]/70 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
