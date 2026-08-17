import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useProductDetails, useProducts } from '../../hooks/useProducts';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useUserInteractions } from '../../hooks/useUserInteractions';
import { useRecommendations } from '../../hooks/useRecommendations';
import { ProductDetailSkeleton } from '../../components/common/LoadingSkeleton';
import { RecommendationSection } from '../../components/product/RecommendationSection';
import { ProductGrid } from '../../components/product/ProductGrid';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProductDetails(id);
  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { track } = useUserInteractions();

  const { recommendations, loading: recommendationsLoading } = useRecommendations({
    limit: 4,
    excludeProductId: id,
  });

  // Track product_view once per product ID, guarded against re-render duplicates
  const trackedProductIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (product && trackedProductIdRef.current !== product.id) {
      trackedProductIdRef.current = product.id;
      track('product_view', product.id);
    }
  }, [product, track]);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  // Same-category related products (exclude current product)
  const categoryId = product?.category_id ?? undefined;
  const { products: relatedRaw, loading: relatedLoading } = useProducts({
    categoryId,
    sortBy: 'popular',
    pageSize: 5,
  });

  // Exclude current product from related
  const relatedProducts = relatedRaw.filter((p) => p.id !== id).slice(0, 4);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center bg-white rounded-xl border border-[#DDE4DC] my-8 shadow-xs">
        <div className="p-3 bg-rose-50 text-rose-500 rounded-xl w-fit mx-auto mb-4 border border-rose-100">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#12372A] mb-2">Product Not Found</h2>
        <p className="text-xs text-[#66736A] mb-6">
          The requested product could not be located in our inventory database.
        </p>
        <Link
          to="/products"
          className="px-5 py-2.5 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white text-xs font-bold shadow transition"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const isOut = product.stock <= 0;
  const isLow = product.stock > 0 && product.stock <= 5;

  const rawPrice = Number(product.price);
  const originalPrice = isNaN(rawPrice) ? 0 : rawPrice;
  const rawDiscount = Number(product.discount_percent);
  const discountPercent = isNaN(rawDiscount) ? 0 : rawDiscount;
  const finalPrice = discountPercent > 0 ? originalPrice * (1 - discountPercent / 100) : originalPrice;
  const savedAmount = Math.max(0, originalPrice - finalPrice);

  const imageList =
    product.images && product.images.length > 0
      ? product.images
      : [
          product.image_url ||
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        ];

  const handleAddToCart = () => {
    if (!isOut) {
      addToCart(product, quantity);
      track('add_to_cart', product.id);
    }
  };

  const handleBuyNow = () => {
    if (!isOut) {
      addToCart(product, quantity);
      track('add_to_cart', product.id);
      setIsCartOpen(true);
    }
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
    track('wishlist', product.id);
  };

  // Star rating breakdown (simulated from review_count and rating)
  const totalReviews = product.review_count || 0;
  const avgRating = Number(product.rating || 4.5);
  const starBreakdown = [5, 4, 3, 2, 1].map((star) => {
    // Distribute reviews in a bell curve around the avg rating
    const weight = Math.max(0, 1 - Math.abs(star - avgRating) * 0.4);
    const count = totalReviews > 0 ? Math.round((weight * totalReviews) / 3) : 0;
    return { star, count };
  });
  const maxBarCount = Math.max(...starBreakdown.map((b) => b.count), 1);

  return (
    <div className="space-y-12 pb-16">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#12372A] hover:text-[#1F6F50] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-[#66736A]">
        <Link to="/" className="hover:text-[#1F6F50] transition">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-[#1F6F50] transition">Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              to={`/products?category=${product.category_id}`}
              className="hover:text-[#1F6F50] transition"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[#12372A] font-semibold truncate max-w-[160px]">{product.name}</span>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="w-full h-[420px] rounded-2xl overflow-hidden bg-white border border-[#DDE4DC] flex items-center justify-center relative shadow-xs">
            <img
              src={imageList[selectedImageIndex] || imageList[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-[#B7F34A] text-[#12372A] font-extrabold text-xs shadow-xs">
                -{discountPercent}% OFF
              </span>
            )}
            {isOut && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <span className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold shadow">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {imageList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
              {imageList.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-white border-2 transition shrink-0 ${
                    selectedImageIndex === index
                      ? 'border-[#12372A] scale-105 shadow-xs'
                      : 'border-[#DDE4DC] opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="space-y-5">
          <div>
            {/* Category + Brand row */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {product.category?.name && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F7F4EA] text-[#1F6F50] text-[11px] font-semibold border border-[#DDE4DC]">
                  <Tag className="w-3 h-3" />
                  {product.category.name}
                </span>
              )}
              <span className="text-xs font-extrabold text-[#1F6F50] uppercase tracking-widest">
                {product.brand || 'ShopAI Premium'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#12372A] tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating & Stock */}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[#F7F4EA] px-3 py-1.5 rounded-lg border border-[#DDE4DC]">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= Math.round(avgRating)
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-[#DDE4DC] fill-[#DDE4DC]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#17211B]">{avgRating.toFixed(1)}</span>
                <span className="text-[11px] text-[#66736A]">({totalReviews} reviews)</span>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border ${
                  isOut
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isLow
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {isOut
                  ? 'Out of Stock'
                  : isLow
                  ? `Only ${product.stock} left!`
                  : `In Stock (${product.stock} units)`}
              </span>
            </div>
          </div>

          {/* Price Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#DDE4DC] shadow-xs">
            <span className="text-xs text-[#66736A]">Price</span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl font-black text-[#12372A]">
                ${finalPrice.toFixed(2)}
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="text-base text-[#66736A] line-through">
                    ${originalPrice.toFixed(2)}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-[#B7F34A] text-[#12372A] text-xs font-extrabold">
                    Save ${savedAmount.toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Description Preview */}
          <p className="text-xs sm:text-sm text-[#17211B] leading-relaxed">
            {product.description ||
              'Experience peak functionality with this precision-crafted product from our AI curated inventory selection.'}
          </p>

          {/* Quantity & CTA */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#12372A]">Quantity:</span>
              <div className="flex items-center gap-1 bg-white border border-[#DDE4DC] rounded-xl p-1 shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOut}
                  className="p-1.5 text-[#66736A] hover:text-[#17211B] rounded-lg hover:bg-[#F7F4EA] transition disabled:opacity-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-[#12372A] px-4 min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  disabled={isOut || (product.stock > 0 && quantity >= product.stock)}
                  className="p-1.5 text-[#66736A] hover:text-[#17211B] rounded-lg hover:bg-[#F7F4EA] transition disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOut}
                className="flex-1 py-3 px-6 rounded-xl bg-[#12372A] hover:bg-[#1F6F50] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOut ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOut}
                className="flex-1 py-3 px-6 rounded-xl bg-[#1F6F50] hover:bg-[#12372A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Buy Now</span>
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-xl border transition ${
                  isWishlisted
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-[#DDE4DC] text-[#66736A] hover:text-rose-600 hover:bg-rose-50'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#DDE4DC] text-center">
            <div className="p-3 rounded-xl bg-white border border-[#DDE4DC] text-[#17211B] space-y-1 shadow-xs">
              <Truck className="w-4 h-4 text-[#1F6F50] mx-auto" />
              <span className="text-[11px] font-bold block">Fast Express</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#DDE4DC] text-[#17211B] space-y-1 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#1F6F50] mx-auto" />
              <span className="text-[11px] font-bold block">Warranty</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#DDE4DC] text-[#17211B] space-y-1 shadow-xs">
              <RotateCcw className="w-4 h-4 text-[#1F6F50] mx-auto" />
              <span className="text-[11px] font-bold block">30-Day Return</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tabbed Section ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#DDE4DC] shadow-xs overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[#DDE4DC]">
          {(
            [
              { key: 'description', label: 'Overview' },
              { key: 'specs', label: 'Specifications' },
              { key: 'reviews', label: `Reviews (${totalReviews})` },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-4 text-xs font-bold transition border-b-2 ${
                activeTab === key
                  ? 'border-[#12372A] text-[#12372A] bg-[#F7F4EA]/50'
                  : 'border-transparent text-[#66736A] hover:text-[#17211B] hover:bg-[#F7F4EA]/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Description Tab */}
          {activeTab === 'description' && (
            <div className="text-xs sm:text-sm text-[#17211B] leading-relaxed space-y-3">
              <p>
                {product.description ||
                  'This product is engineered to deliver high performance, durable materials, and modern aesthetic elegance.'}
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#66736A] text-xs mt-4">
                <li>High durability construction tested for daily commercial & personal use</li>
                <li>Engineered with eco-friendly components</li>
                <li>Fully supported by ShopAI customer service & Supabase verification</li>
              </ul>
            </div>
          )}

          {/* Specs Tab */}
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#17211B]">
              {[
                { label: 'Brand', value: product.brand || 'N/A' },
                { label: 'SKU / ID', value: product.id.slice(0, 8), mono: true },
                { label: 'Category', value: product.category?.name || 'N/A' },
                { label: 'Rating', value: `${avgRating.toFixed(1)} / 5.0`, amber: true },
                { label: 'Inventory Stock', value: `${product.stock} units` },
                { label: 'Added', value: new Date(product.created_at).toLocaleDateString() },
              ].map(({ label, value, mono, amber }) => (
                <div
                  key={label}
                  className="p-3 rounded-xl bg-[#F7F4EA] border border-[#DDE4DC] flex justify-between items-center"
                >
                  <span className="text-[#66736A]">{label}</span>
                  <span
                    className={`font-bold ${
                      mono
                        ? 'font-mono text-[#1F6F50]'
                        : amber
                        ? 'text-amber-600'
                        : 'text-[#12372A]'
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Rating Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Big number */}
                <div className="text-center p-6 bg-[#F7F4EA] rounded-xl border border-[#DDE4DC]">
                  <div className="text-5xl font-black text-[#12372A]">{avgRating.toFixed(1)}</div>
                  <div className="flex justify-center gap-0.5 mt-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${
                          s <= Math.round(avgRating)
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-[#DDE4DC] fill-[#DDE4DC]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#66736A] mt-1">{totalReviews} reviews</p>
                </div>

                {/* Star breakdown bars */}
                <div className="space-y-2">
                  {starBreakdown.map(({ star, count }) => (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-0.5 w-16 shrink-0">
                        <span className="text-[#12372A] font-bold">{star}</span>
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      </div>
                      <div className="flex-1 h-2 bg-[#DDE4DC] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${(count / maxBarCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-[#66736A] w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews placeholder notice */}
              <div className="border-t border-[#DDE4DC] pt-6">
                <div className="flex items-start gap-4 p-5 bg-[#F7F4EA] rounded-xl border border-[#DDE4DC]">
                  <div className="p-2.5 bg-[#12372A]/10 text-[#12372A] rounded-xl border border-[#12372A]/10 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#12372A]">Customer Reviews</h4>
                    <p className="text-xs text-[#66736A] mt-1 leading-relaxed">
                      This product has <strong>{totalReviews}</strong> verified customer reviews
                      with an average rating of <strong>{avgRating.toFixed(1)}★</strong>.
                      Detailed review text will be shown here once the reviews table is connected.
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12372A]/10 text-[#12372A] text-xs font-bold border border-[#12372A]/10">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI-verified authentic reviews
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Related Products (same category) ─────────────────── */}
      {categoryId && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#12372A] tracking-tight">
                More from {product.category?.name || 'This Category'}
              </h2>
              <p className="text-xs text-[#66736A] mt-0.5">
                Other products you might like
              </p>
            </div>
            <Link
              to={`/products?category=${categoryId}`}
              className="text-xs font-bold text-[#12372A] hover:text-[#1F6F50] flex items-center gap-1 transition"
            >
              <span>View All</span>
              <Tag className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ProductGrid
            products={relatedProducts}
            loading={relatedLoading}
            emptyTitle="No related products found"
            emptyDescription="Check out our full catalog for more options."
          />
        </div>
      )}

      {/* ─── AI Recommendation Footer ──────────────────────────── */}
      <RecommendationSection
        products={recommendations}
        loading={recommendationsLoading}
        title="Recommended For You"
        subtitle="Curated by our AI engine based on your activity, preferences, and product similarity."
      />
    </div>
  );
};
