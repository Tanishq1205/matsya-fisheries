import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Scale, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Truck, 
  Utensils 
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { cleanedWeightRange, formatCleanedWeight } from '../../services/cleanedWeight';
import PremiumPreorder from '../catalog/PremiumPreorder';
import RelatedProducts from './RelatedProducts';

const DEFAULT_FALLBACK_PRODUCT = {
  id: 'matsya-default',
  name: 'Fresh Coastal Catch',
  localName: '(ताजी मासोळी)',
  marathiName: 'ताजी मासोळी',
  subtitle: 'Daily dock landing cleaned and customized to order.',
  badgeText: '100% DOCK FRESH',
  landingOrigin: 'Cleaned',
  price_500g: 399,
  price_1kg: 750,
  pricePerGrossKg: 750,
  images: [
    'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
  ],
  cuts: [
    { id: 'std-cut', name: 'Cleaned', description: 'Gutted, descaled and ready to cook.', yield: '~75% Yield', yieldPercentage: 75 }
  ],
  weightPacks: [
    { gross: 500, label: '500g' },
    { gross: 1000, label: '1kg' }
  ],
};

export default function ProductDetailsPage({ product, onBack, onSelectProduct }) {
  const cartStore = useCartStore();
  const addItem = cartStore?.addItem || cartStore?.addToCart || (() => {});

  // Safely assign incoming product or fallback
  const currentProduct = product || DEFAULT_FALLBACK_PRODUCT;

  const images = Array.isArray(currentProduct.images) && currentProduct.images.length > 0 
    ? currentProduct.images 
    : [currentProduct.image || DEFAULT_FALLBACK_PRODUCT.images[0]];

  const cuts = Array.isArray(currentProduct.cuts) && currentProduct.cuts.length > 0 
    ? currentProduct.cuts 
    : DEFAULT_FALLBACK_PRODUCT.cuts;

  const weightPacks = Array.isArray(currentProduct.weightPacks) && currentProduct.weightPacks.length > 0 
    ? currentProduct.weightPacks 
    : DEFAULT_FALLBACK_PRODUCT.weightPacks;

  // Active Selections State
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [selectedCut, setSelectedCut] = useState(cuts[0]);
  const [selectedWeightPack, setSelectedWeightPack] = useState(weightPacks[0]);
  const [quantity, setQuantity] = useState(1);

  // Sync state & scroll to top whenever selected product changes
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

  }, [currentProduct.id]);

  const grossGrams = selectedWeightPack?.gross || 500;
  const cleanedWeight = formatCleanedWeight(cleanedWeightRange(currentProduct, grossGrams, quantity));

  // Dynamic Price Calculation matching 500g vs 1kg DB columns
  const getUnitPrice = () => {
    if (grossGrams === 500 && currentProduct.price_500g) {
      return currentProduct.price_500g;
    }
    if (grossGrams === 1000 && (currentProduct.price_1kg || currentProduct.pricePerGrossKg)) {
      return currentProduct.price_1kg || currentProduct.pricePerGrossKg;
    }
    const fallbackRate = currentProduct.pricePerGrossKg || currentProduct.price_1kg || currentProduct.price_500g || 700;
    return Math.round((fallbackRate * grossGrams) / 1000);
  };

  const calculatedPrice = getUnitPrice();

  const handleAddToCart = () => {
    const itemToAdd = {
      id: `${currentProduct.id}-${selectedCut?.name || 'cut'}-${grossGrams}g`,
      productId: currentProduct.id,
      in_stock: currentProduct.in_stock,
      is_active: currentProduct.is_active,
      name: currentProduct.name,
      marathiName: currentProduct.localName || (currentProduct.marathiName ? `(${currentProduct.marathiName})` : ''),
      cut: selectedCut?.name || 'Cleaned',
      weight: `${grossGrams}g`,
      grossWeight: `${grossGrams}g`,
      netWeight: formatCleanedWeight(cleanedWeightRange(currentProduct, grossGrams)),
      price: calculatedPrice,
      quantity,
      image: images[0],
    };
    if (addItem) addItem(itemToAdd, `${grossGrams}g`, selectedCut?.name || 'Cleaned', quantity);
  };

  return (
    <div className="w-full bg-[#FAF7EE] text-[#1D184D] min-h-screen pt-24 pb-20 font-['Sora',sans-serif]">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wider text-[#1D184D]/70 hover:text-[#1D184D] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO CATALOG
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden bg-[#16123D] border-[3px] border-[#1D184D]/10 shadow-xl">
              <img
                src={selectedImage}
                alt={currentProduct.name}
                className="w-full h-full object-cover transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_FALLBACK_PRODUCT.images[0];
                }}
              />
              <span className="absolute top-4 left-4 bg-[#C2542D] text-white text-[11px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-md">
                {currentProduct.badgeText || '100% DOCK FRESH'}
              </span>
            </div>

            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-24 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImage === img
                        ? 'border-[#D5C582] scale-105 shadow-md ring-2 ring-[#D5C582]/40'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Right Column: Cuts, Pack Sizes & Checkout CTA */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#C2542D] uppercase mb-1">
                <span>{currentProduct.landingOrigin || 'Cleaned'}</span>
                {currentProduct.category && (
                  <>
                    <span>•</span>
                    <span>{currentProduct.category}</span>
                  </>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1D184D] leading-tight uppercase">
                {currentProduct.name}
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-[#1D184D]/70 mt-1">
                {currentProduct.localName || (currentProduct.marathiName ? `(${currentProduct.marathiName})` : '')}
              </p>
              <p className="text-sm text-[#1D184D]/80 mt-3 leading-relaxed">
                {currentProduct.subtitle}
              </p>
            </div>

            <div className="flex items-baseline gap-3 bg-[#1D184D] text-[#FAF7EE] p-5 rounded-2xl shadow-lg">
              <span className="text-3xl sm:text-4xl font-black text-[#D5C582]">
                ₹{calculatedPrice * quantity}
              </span>
              <span className="text-xs sm:text-sm text-[#FAF7EE]/70 font-medium">
                For {grossGrams * quantity}g before cleaning
              </span>
            </div>

            {/* Custom Fish Cuts Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold uppercase tracking-widest text-[#1D184D] flex items-center justify-between">
                <span>1. Choose Fish Cut</span>
                <span className="text-[11px] text-[#C2542D] font-semibold">Cleaned & Ready to Cook</span>
              </label>

              <div className="grid grid-cols-1 gap-3">
                {cuts.map((cut, index) => {
                  const isSelected = selectedCut?.name === cut.name;
                  return (
                    <button
                      key={cut.id || cut.name || index}
                      type="button"
                      onClick={() => setSelectedCut(cut)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1D184D] text-[#FAF7EE] border-[#1D184D] shadow-md'
                          : 'bg-white/80 text-[#1D184D] border-[#1D184D]/10 hover:border-[#1D184D]/40'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold uppercase tracking-wider">{cut.name}</span>
                      </div>
                      <p className={`text-xs ${isSelected ? 'text-[#FAF7EE]/80' : 'text-[#1D184D]/60'}`}>
                        {cut.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weight Pack Selection */}
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold uppercase tracking-widest text-[#1D184D]">
                2. Choose Pack Size
              </label>

              <div className="grid grid-cols-2 gap-3">
                {weightPacks.map((pack) => (
                  <button
                    key={pack.gross}
                    type="button"
                    onClick={() => setSelectedWeightPack(pack)}
                    className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      selectedWeightPack?.gross === pack.gross
                        ? 'bg-[#1D184D] text-[#D5C582] border-[#1D184D] shadow-md font-bold'
                        : 'bg-white/80 text-[#1D184D] border-[#1D184D]/10 font-semibold hover:border-[#1D184D]/40'
                    }`}
                  >
                    <span className="block text-sm">{pack.gross === 1000 ? '1kg' : '500g'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Approximate cleaned weight for the selected packs */}
            <div className="bg-[#D5C582]/20 border border-[#D5C582] p-4 rounded-2xl flex items-center gap-3">
              <Scale className="w-6 h-6 text-[#1D184D] shrink-0" />
              <div className="text-xs text-[#1D184D]">
                <span className="font-bold uppercase block mb-0.5">Weight after cleaning & cutting</span>
                <p>Ordered weight before cleaning: <strong>{grossGrams * quantity}g</strong>.</p>
                <p className="mt-1" aria-live="polite">{cleanedWeight ? <>Approximate weight after cleaning: <strong>{cleanedWeight}</strong>.</> : 'Cleaned weight varies by fish and cut. Contact us for an estimate before ordering.'}</p>
                <p className="mt-2 text-[#1D184D]/70">These are approximate weights and may vary depending on the fish variety and preparation method.</p>
              </div>
            </div>

            {/* Quantity Adjuster & Add to Cart CTA */}
            <div className="flex flex-col gap-3 pt-2">
              <h2 className="text-xs font-bold uppercase tracking-widest">3. Number of Packs</h2>
              <p className="text-xs text-[#1D184D]/70">
                Use + to add more packs. For 1.5kg, choose 500g and select 3 packs.
              </p>
              <p className="text-sm font-semibold" aria-live="polite">
                {quantity} × {grossGrams === 1000 ? '1kg' : '500g'} = {grossGrams * quantity >= 1000 ? `${grossGrams * quantity / 1000}kg` : `${grossGrams * quantity}g`} total
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center bg-white border border-[#1D184D]/20 rounded-full p-1.5 shadow-sm">
                <button
                  type="button"
                  aria-label="Remove one pack"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-full bg-[#FAF7EE] hover:bg-[#1D184D] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                <button
                  type="button"
                  aria-label="Add one pack"
                  disabled={quantity >= 999}
                  onClick={() => setQuantity((q) => Math.min(999, q + 1))}
                  className="w-9 h-9 rounded-full bg-[#FAF7EE] hover:bg-[#1D184D] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={currentProduct.in_stock === false || currentProduct.is_active === false}
                className="w-full sm:w-auto flex-1 bg-[#1D184D] hover:bg-[#15113A] text-[#D5C582] py-4 px-6 rounded-full font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-200 transform active:scale-[0.98] flex items-center justify-center gap-3 border border-[#D5C582]/30 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-[#D5C582]" />
                ADD TO CART • ₹{calculatedPrice * quantity}
              </button>
              </div>
            </div>

            {currentProduct.category === 'Premium Sea Fish' && <PremiumPreorder products={[currentProduct]} />}

            <div className="flex items-center justify-between text-xs font-semibold text-[#1D184D]/70 border-t border-[#1D184D]/10 pt-4 mt-2">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#C2542D]" /> Same-Day Dock Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-[#C2542D]" /> Temperature-Controlled Packaging
              </span>
            </div>
          </div>

        </div>

        {/* Related Products Rail */}
        <RelatedProducts
          currentProduct={currentProduct}
          onSelectProduct={onSelectProduct}
        />
      </div>
    </div>
  );
}
