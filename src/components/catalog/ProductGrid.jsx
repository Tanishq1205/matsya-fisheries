import React, { useState, useEffect } from 'react';
import { Eye, Search, X, Loader2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { getAllProducts } from '../../services/productService';

/**
 * Format database product row into standard payload for Product Details Modal
 */
export const formatForDetailsPage = (item) => {
  const defaultImage = item.image_url || 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=800&auto=format&fit=crop&q=80';
  const galleryImages = item.gallery_urls && Array.isArray(item.gallery_urls) && item.gallery_urls.length > 0
    ? item.gallery_urls
    : [defaultImage];

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    marathiName: item.marathi_name || '',
    localName: item.marathi_name ? `(${item.marathi_name})` : '',
    subtitle: item.subtitle || '',
    badgeText: item.badge_text || '100% DOCK FRESH',
    landingOrigin: item.landing_origin || 'Cleaned & RO Washed',
    price_500g: item.price_500g,
    price_1kg: item.price_1kg,
    mrp_500g: item.mrp_500g,
    mrp_1kg: item.mrp_1kg,
    discountPercent: item.discount_percent || 20,
    images: [defaultImage, ...galleryImages.filter(img => img !== defaultImage)],
    cuts: item.cut_options_detail && Array.isArray(item.cut_options_detail) && item.cut_options_detail.length > 0
      ? item.cut_options_detail
      : [
          {
            name: item.standard_cut || 'Cleaned & RO Washed',
            description: 'Gutted, descaled, washed in pure RO water and ready to cook.',
            yield: '~80% Yield'
          }
        ],
    weightPacks: item.price_500g ? [
      { gross: 500, label: item.servings_500g || '500g Pack (Serves 2–3)', netWeight: item.net_weight_500g || '~350g Net' },
      { gross: 1000, label: item.servings_1kg || '1kg Pack (Serves 4–6)', netWeight: item.net_weight_1kg || '~700g Net' },
    ] : [
      { gross: 1000, label: item.servings_1kg || '1kg Pack (Serves 4–6)', netWeight: item.net_weight_1kg || '~700g Net' },
    ],
    healthBenefits: item.nutritional_benefits && Array.isArray(item.nutritional_benefits) && item.nutritional_benefits.length > 0
      ? item.nutritional_benefits
      : [
          { title: 'Pure Protein', value: '20g / 100g', description: 'Promotes muscle repair and daily metabolic energy.' },
          { title: 'Rich in Omega-3', value: '1.2g EPA/DHA', description: 'Supports arterial health and lowers inflammation.' }
        ],
  };
};

function ProductCard({ product, onSelectProduct }) {
  const [weight, setWeight] = useState(product.price_500g ? '500g' : '1kg');
  const addItem = useCartStore((state) => state.addItem);

  const price = weight === '500g' ? product.price_500g : product.price_1kg;
  const mrp = weight === '500g' ? product.mrp_500g : product.mrp_1kg;
  
  // Calculate display MRP if null in database
  const originalPrice = mrp || Math.round(price * (1 + (product.discount_percent || 20) / 100));
  const discountPercent = product.discount_percent || Math.round(((originalPrice - price) / originalPrice) * 100);

  const displayImage = product.image_url || 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=60';

  const handleOpenDetails = () => {
    if (onSelectProduct) {
      onSelectProduct(formatForDetailsPage(product));
    }
  };

  return (
    <div 
      onClick={handleOpenDetails}
      className="group rounded-2xl bg-[#16123D] border-[3px] border-[#D5C582]/20 hover:border-[#D5C582] p-5 flex flex-col justify-between hover:shadow-[0_10px_30px_rgba(213,197,130,0.35)] hover:-translate-y-1 transition-all duration-300 shadow-md cursor-pointer"
    >
      <div>
        <div className="flex items-center justify-between text-[11px] mb-3">
          <span className="font-bold tracking-wider uppercase text-[#D5C582] bg-[#D5C582]/10 px-2.5 py-0.5 rounded-full">
            {product.badge_text || 'Fresh Landing'}
          </span>
          <span className="text-[#FAF7EE]/70 text-xs font-medium flex items-center gap-1 group-hover:text-[#D5C582] transition-colors">
            <Eye className="w-3.5 h-3.5" />Click to View Details
          </span>
        </div>

        <div className="relative w-full h-44 my-3 rounded-xl overflow-hidden bg-[#100D2D] border border-white/5">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=60';
            }}
          />
        </div>

        <div className="flex items-baseline gap-2">
          <h3 className="text-xl font-bold text-[#FAF7EE] tracking-tight font-['Sora',sans-serif] group-hover:text-[#D5C582] transition-colors">
            {product.name}
          </h3>
          {product.marathi_name && (
            <span className="text-sm font-semibold text-[#D5C582]">
              ({product.marathi_name})
            </span>
          )}
        </div>
        <p className="text-xs text-[#FAF7EE]/65 font-medium mt-1">
          {product.subtitle}
        </p>
      </div>

      {product.price_500g ? (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="my-5 bg-[#100D2D] p-1 rounded-xl flex items-center border border-white/5"
        >
          <button
            type="button"
            onClick={() => setWeight('500g')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              weight === '500g'
                ? 'bg-[#D5C582] text-[#1D184D] shadow-sm'
                : 'text-[#FAF7EE]/60 hover:text-white'
            }`}
          >
            500g
          </button>
          <button
            type="button"
            onClick={() => setWeight('1kg')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              weight === '1kg'
                ? 'bg-[#D5C582] text-[#1D184D] shadow-sm'
                : 'text-[#FAF7EE]/60 hover:text-white'
            }`}
          >
            1 kg
          </button>
        </div>
      ) : (
        <div className="my-5 py-2 px-3 rounded-xl bg-[#100D2D]/60 border border-white/5 flex items-center justify-between text-xs">
          <span className="text-[#FAF7EE]/50 font-medium">Standard Pack</span>
          <span className="text-[#D5C582] font-bold">1 kg</span>
        </div>
      )}

      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#FAF7EE] font-['Sora',sans-serif]">
              ₹{price}
            </span>
            {originalPrice > price && (
              <span className="text-xs text-[#FAF7EE]/40 line-through">
                ₹{originalPrice}
              </span>
            )}
          </div>
          {discountPercent > 0 && (
            <span className="text-[10px] font-bold text-[#C2542D] tracking-wider uppercase block">
              Save {discountPercent}% Today
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (addItem) addItem(product, weight);
          }}
          className="py-2.5 px-4 rounded-xl bg-[#D5C582] hover:bg-[#E5D79E] text-[#1D184D] text-xs font-bold tracking-wider uppercase transition-all duration-150 active:scale-95 cursor-pointer"
        >
          Quick Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function ProductGrid({ onSelectProduct }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    { key: 'ALL', label: 'All Catches' },
    { key: 'Premium Sea Fish', label: 'Premium Sea Fish' },
    { key: 'Prawns & Shellfish', label: 'Prawns & Shellfish' },
    { key: 'Daily Catch', label: 'Daily Catch' },
  ];

  // Fetch active products from Supabase on component mount
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const { data, error } = await getAllProducts();
      
      if (error) {
        setErrorMsg('Failed to load catches. Please refresh.');
      } else {
        setProducts(data || []);
      }
      setIsLoading(false);
    }

    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'ALL' || product.category === selectedCategory;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (product.name && product.name.toLowerCase().includes(query)) ||
      (product.marathi_name && product.marathi_name.toLowerCase().includes(query)) ||
      (product.subtitle && product.subtitle.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="all-products" className="relative w-full bg-[#FAF7EE] select-none pb-28">
      <div className="relative w-full overflow-hidden leading-none">
        <div className="w-full bg-[#1D184D] border-y border-[#D5C582]/25 py-4 px-6 sm:px-12 shadow-sm">
          <div className="max-w-[1560px] mx-auto flex flex-wrap items-center justify-between gap-y-2 text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-[#D5C582] font-['Sora',sans-serif]">
            <span>Dock-to-Door Mumbai</span>
            <span className="text-[#D5C582]/40">◆</span>
            <span>Pure and Fresh</span>
            <span className="text-[#D5C582]/40">◆</span>
            <span>Daily Coastal Landing</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1560px] mx-auto px-6 sm:px-12 pt-16 mb-8">
        <span className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#C2542D] block mb-2 font-['Sora',sans-serif]">
          Daily Harbor Catch
        </span>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h2 className="text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight text-[#1D184D] leading-tight font-['Sora',sans-serif]">
            All Fresh Catches.{' '}
            <span className="text-[#1D184D]/50 font-normal block sm:inline sm:ml-2">
              Cleaned, cut, and packed to order.
            </span>
          </h2>
          <span className="text-xs font-semibold tracking-wider uppercase text-[#1D184D]/60 font-['Sora',sans-serif]">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Item' : 'Items'} Available
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-[1560px] mx-auto px-6 sm:px-12 mb-10">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white/80 p-3 sm:p-4 rounded-2xl border border-[#1D184D]/10 shadow-sm backdrop-blur-md">
          {/* Search Input Field */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1D184D]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or Marathi (Surmai, पापलेट, Bombil)..."
              className="w-full pl-11 pr-10 py-2.5 bg-[#FAF7EE] border border-[#1D184D]/15 rounded-xl text-xs sm:text-sm font-semibold text-[#1D184D] placeholder-[#1D184D]/40 focus:outline-none focus:border-[#1D184D] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#1D184D]/50 hover:text-[#1D184D]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#1D184D] text-[#D5C582] shadow-sm'
                      : 'bg-[#FAF7EE] text-[#1D184D]/70 hover:text-[#1D184D] border border-[#1D184D]/10'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1560px] mx-auto px-6 sm:px-12">
        {isLoading ? (
          <div className="w-full py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#1D184D] animate-spin" />
            <p className="text-xs font-bold tracking-wider uppercase text-[#1D184D]/60">
              Fetching Fresh Catch from Harbor...
            </p>
          </div>
        ) : errorMsg ? (
          <div className="w-full py-16 text-center bg-white/50 rounded-2xl border border-red-200 text-red-600 text-sm font-semibold">
            {errorMsg}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8 p-2 overflow-visible">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onSelectProduct={onSelectProduct} 
              />
            ))}
          </div>
        ) : (
          <div className="w-full py-16 text-center bg-white/50 rounded-2xl border border-[#1D184D]/10">
            <p className="text-sm font-bold text-[#1D184D]">No catches found matching "{searchQuery}"</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
              className="mt-3 text-xs font-bold text-[#C2542D] uppercase tracking-wider hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}