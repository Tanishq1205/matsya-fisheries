import React, { useState } from 'react';
import { Eye, Search, X } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

// SPECIES-SPECIFIC CUTS & NUTRITION DATABASE
export const PRODUCT_SPECIFIC_DATA = {
  1: { // Squids
    image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'squid-rings', name: 'Cleaned Rings & Tentacles', description: 'Ink bag & quill removed, sliced into rings for calamari fry or curry.', yieldPercentage: 65 },
      { id: 'squid-whole', name: 'Whole Cleaned Tube', description: 'Gutted and cleaned tube left whole, ideal for stuffing and grilling.', yieldPercentage: 75 },
    ],
    healthBenefits: [
      { title: 'Copper & B12', value: '90% RDA', description: 'Supports red blood cell formation and nervous system.' },
      { title: 'Lean Protein', value: '18g / 100g', description: 'Low fat content ideal for clean calorie diets.' },
    ],
  },
  2: { // Mushi
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'mushi-cubes', name: 'Skinless Boneless Cubes', description: 'Thick skin peeled, cartilage removed, cut into soft curry cubes.', yieldPercentage: 70 },
      { id: 'mushi-steaks', name: 'Skinless Steaks', description: 'Skinless center steaks perfect for traditional Koli shark curry.', yieldPercentage: 80 },
    ],
    healthBenefits: [
      { title: 'Collagen Rich', value: 'High Natural', description: 'Supports joint health and skin elasticity.' },
      { title: 'Pure Protein', value: '21g / 100g', description: 'Dense muscle-building nutrition without fine bones.' },
    ],
  },
  3: { // Shrimole
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'shrimole-peeled', name: 'Peeled & Deveined', description: 'Shell and vein removed, washed in pure RO water.', yieldPercentage: 55 },
      { id: 'shrimole-whole', name: 'Whole Shell-On', description: 'Unpeeled fresh tiny prawns for traditional Sukka gravy.', yieldPercentage: 85 },
    ],
    healthBenefits: [
      { title: 'Zinc & Iodine', value: '70% RDA', description: 'Essential minerals for metabolic function.' },
    ],
  },
  4: { // Tiger Prawns
    image: 'https://images.unsplash.com/photo-1559737605-17ac46200232?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'tiger-tail-on', name: 'Peeled & Deveined (Tail-On)', description: 'Shell removed with tail retained for gourmet presentation.', yieldPercentage: 60 },
      { id: 'tiger-tail-off', name: 'Peeled & Deveined (Tail-Off)', description: '100% shell-free & vein-free, ready to cook.', yieldPercentage: 55 },
    ],
    healthBenefits: [
      { title: 'Astaxanthin', value: 'High Antioxidant', description: 'Natural compound that supports skin and heart health.' },
    ],
  },
  5: { // Red Prawns
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'red-peeled', name: 'Peeled & Deveined', description: 'Vein removed and shell peeled for quick sauteing.', yieldPercentage: 58 },
    ],
    healthBenefits: [
      { title: 'Natural Sweetness', value: 'Sea Fresh', description: 'Naturally rich in glycine and amino acids.' },
    ],
  },
  6: { // Scampi
    image: 'https://images.unsplash.com/photo-1559737605-17ac46200232?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'scampi-butterflied', name: 'Butterflied (Shell-On)', description: 'Split open down the center for garlic butter oven bake.', yieldPercentage: 70 },
    ],
    healthBenefits: [
      { title: 'Selenium Power', value: '85% RDA', description: 'Potent antioxidant defending against cellular stress.' },
    ],
  },
  7: { // Surmai
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'surmai-tawa-fry', name: 'Tawa Fry Steaks', description: 'Uniform 12-15mm thick center-cut round steaks for frying.', yieldPercentage: 85 },
      { id: 'surmai-curry-cut', name: 'Curry Cut (With Head & Tail)', description: 'Steaks plus head/tail pieces for rich Malvani gravy.', yieldPercentage: 80 },
    ],
    healthBenefits: [
      { title: 'Omega-3 King', value: '1.8g EPA/DHA', description: 'Reduces bad cholesterol and improves arterial health.' },
    ],
  },
  8: { // Basa Fillets
    image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'basa-fillet', name: 'Boneless Skinless Fillets', description: 'Pure trimmed fillet slabs, 100% bone-free.', yieldPercentage: 100 },
    ],
    healthBenefits: [
      { title: 'Zero Bone Risk', value: '100% Boneless', description: 'Safe for children and senior family members.' },
    ],
  },
  9: { // Bangda
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'bangda-whole', name: 'Whole Cleaned (Slitted)', description: 'Gills & gut removed, deep side slits cut for masala stuffing.', yieldPercentage: 75 },
    ],
    healthBenefits: [
      { title: 'Mega Omega-3', value: '2.2g EPA/DHA', description: 'Highest omega-3 concentration among coastal fish.' },
    ],
  },
  10: { // White Pomfret
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'pomfret-whole-head', name: 'Whole Cleaned (With Head)', description: 'Gutted & descaled with side cuts for stuffed Pomfret fry.', yieldPercentage: 80 },
      { id: 'pomfret-steaks', name: 'Pomfret Steaks / Slices', description: 'Sliced across into delicate white meat steaks.', yieldPercentage: 75 },
    ],
    healthBenefits: [
      { title: 'Prized Delicacy', value: 'Sweet White Meat', description: 'Delicate flavor profile with zero fishy smell.' },
    ],
  },
  11: { // White Prawns
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'white-prawns-peeled', name: 'Peeled & Deveined', description: 'Cleaned, deshelled, and vein removed.', yieldPercentage: 60 },
    ],
    healthBenefits: [
      { title: 'Low Fat Protein', value: '20g / 100g', description: 'Ideal for weight management.' },
    ],
  },
  12: { // Rawas
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'rawas-steaks', name: 'Rawas Center Steaks', description: 'Thick bone-in steaks ideal for frying or gravy.', yieldPercentage: 82 },
    ],
    healthBenefits: [
      { title: 'Indian Salmon', value: 'High Omega-3', description: 'Nourishes skin, hair, and cognitive health.' },
    ],
  },
  13: { // Tilapia Fillets
    image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'tilapia-fillet', name: 'Boneless Skinless Fillets', description: '100% boneless white fish fillet slabs.', yieldPercentage: 100 },
    ],
    healthBenefits: [
      { title: '100% Boneless', value: 'Clean Cut', description: 'Hassle-free preparation.' },
    ],
  },
  14: { // Chinese Pomfret
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'chinese-pomfret-whole', name: 'Whole Cleaned (Cross Slit)', description: 'Large fleshy pomfret gutted and slitted.', yieldPercentage: 80 },
    ],
    healthBenefits: [
      { title: 'Melt-in-Mouth', value: 'High Collagen', description: 'Butter-soft texture with rich taste.' },
    ],
  },
  15: { // Sardines
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'sardine-head-off', name: 'Whole Cleaned (Head-Off)', description: 'Head & guts removed, descaled for crisp fry.', yieldPercentage: 70 },
    ],
    healthBenefits: [
      { title: 'Calcium Giant', value: '380mg / 100g', description: 'Soft edible bones rich in calcium.' },
    ],
  },
  16: { // Halwa
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'halwa-steaks', name: 'Halwa Steaks', description: 'Firm dark-skin steaks ideal for tawa fry.', yieldPercentage: 80 },
    ],
    healthBenefits: [
      { title: 'Iron Rich', value: '35% RDA', description: 'Supports healthy hemoglobin levels.' },
    ],
  },
  17: { // Mud Crabs
    image: 'https://images.unsplash.com/photo-1559737605-17ac46200232?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'crab-cleaned-halved', name: 'Cleaned & Halved (Cracked Claws)', description: 'Top shell removed, gills cleaned, split in half.', yieldPercentage: 60 },
    ],
    healthBenefits: [
      { title: 'Zinc Champion', value: '100% RDA', description: 'Critical mineral for immune defense.' },
    ],
  },
  18: { // Bombil
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80',
    cuts: [
      { id: 'bombil-flattened', name: 'Cleaned & Flattened (Rava Fry Cut)', description: 'Gutted, head removed, gently pressed flat for crisp frying.', yieldPercentage: 75 },
    ],
    healthBenefits: [
      { title: 'Mumbai Legend', value: 'Crispy Exterior', description: 'Iconic melt-in-mouth texture when fried with rava.' },
    ],
  },
};

export const PRODUCTS = [
  { id: 1, name: 'Squids', marathiName: 'माकुळ', category: 'Prawns & Shellfish', subtitle: 'Tender Calamari', standard_cut: 'Cleaned & RO Washed', price_500g: 399, price_1kg: 749, tag: 'Fresh Catch' },
  { id: 2, name: 'Mushi', marathiName: 'मुशी', category: 'Daily Catch', subtitle: 'Baby Shark / Flake', standard_cut: 'Skinless & Cleaned', price_500g: 441, price_1kg: 699, tag: 'Daily Catch' },
  { id: 3, name: 'Shrimole', marathiName: 'श्रीमॉली', category: 'Prawns & Shellfish', subtitle: 'Small Coastal Prawns', standard_cut: 'Cleaned & RO Washed', price_500g: 301, price_1kg: 599, tag: 'Top Seller' },
  { id: 4, name: 'Tiger Prawns', marathiName: 'वाघा कोळंबी', category: 'Prawns & Shellfish', subtitle: 'Large Coastal Tiger Prawns', standard_cut: 'Cleaned & Deveined', price_500g: 599, price_1kg: 999, tag: 'Premium' },
  { id: 5, name: 'Red Prawns', marathiName: 'तांबडी कोळंबी', category: 'Prawns & Shellfish', subtitle: 'Sweet Medium Sea Prawns', standard_cut: 'Cleaned & Deveined', price_500g: 399, price_1kg: 649, tag: 'Popular' },
  { id: 6, name: 'Scampi', marathiName: 'मोठी कोळंबी / स्कॅम्पी', category: 'Prawns & Shellfish', subtitle: 'Giant Freshwater Prawns', standard_cut: 'Cleaned & RO Washed', price_500g: 699, price_1kg: 1099, tag: 'Delicacy' },
  { id: 7, name: 'Surmai', marathiName: 'सुरमई', category: 'Premium Sea Fish', subtitle: 'King Fish / Seer Fish', standard_cut: 'Cleaned & RO Washed', price_500g: 799, price_1kg: 1249, tag: 'Best Seller' },
  { id: 8, name: 'Basa Fillets', marathiName: 'बासा', category: 'Premium Sea Fish', subtitle: 'Mild White Fish Fillets', standard_cut: 'Skinless & Cleaned', price_500g: null, price_1kg: 599, tag: 'Boneless' },
  { id: 9, name: 'Bangda', marathiName: 'बांगडा', category: 'Daily Catch', subtitle: 'Indian Mackerel', standard_cut: 'Cleaned & RO Washed', price_500g: 345, price_1kg: 549, tag: 'Daily Catch' },
  { id: 10, name: 'White Pomfret (5-6 pcs)', marathiName: 'पांढरा पापलेट', category: 'Premium Sea Fish', subtitle: 'Silver Pomfret', standard_cut: 'Cleaned & RO Washed', price_500g: 899, price_1kg: 1599, tag: 'Royal Catch' },
  { id: 11, name: 'White Prawns', marathiName: 'पांढरी कोळंबी', category: 'Prawns & Shellfish', subtitle: 'Tender White Curry Prawns', standard_cut: 'Cleaned & Deveined', price_500g: 399, price_1kg: 649, tag: 'Curry Cut' },
  { id: 12, name: 'Rawas', marathiName: 'रावस', category: 'Premium Sea Fish', subtitle: 'Indian Salmon', standard_cut: 'Cleaned & RO Washed', price_500g: 799, price_1kg: 1249, tag: 'Chef Choice' },
  { id: 13, name: 'Tilapia Fillets', marathiName: 'तिलापिया', category: 'Premium Sea Fish', subtitle: 'Boneless White Fish Fillets', standard_cut: 'Skinless & Cleaned', price_500g: null, price_1kg: 599, tag: 'Boneless' },
  { id: 14, name: 'Chinese Pomfret', marathiName: 'कापूस पापलेट', category: 'Premium Sea Fish', subtitle: 'Large Premium Pomfret', standard_cut: 'Cleaned & RO Washed', price_500g: 699, price_1kg: 1199, tag: 'Premium' },
  { id: 15, name: 'Sardines', marathiName: 'तारली', category: 'Daily Catch', subtitle: 'Tarli', standard_cut: 'Cleaned & RO Washed', price_500g: 315, price_1kg: 549, tag: 'Daily Catch' },
  { id: 16, name: 'Halwa', marathiName: 'हलवा', category: 'Premium Sea Fish', subtitle: 'Black Pomfret', standard_cut: 'Cleaned & RO Washed', price_500g: 599, price_1kg: 949, tag: 'Popular' },
  { id: 17, name: 'Mud Crabs (5-6 pcs)', marathiName: 'खेकडा', category: 'Prawns & Shellfish', subtitle: 'Fresh Coastal Crabs', standard_cut: 'Cleaned & RO Washed', price_500g: null, price_1kg: 949, tag: 'Live Landing' },
  { id: 18, name: 'Bombil (Bombay Duck)', marathiName: 'बोंबील', category: 'Daily Catch', subtitle: 'Mumbai Classic', standard_cut: 'Cleaned & RO Washed', price_500g: 345, price_1kg: 549, tag: 'Mumbai Special' },
];

export const formatForDetailsPage = (item) => {
  const specificData = PRODUCT_SPECIFIC_DATA[item.id] || {};
  const defaultImage = specificData.image || item.image || 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=800&auto=format&fit=crop&q=80';

  return {
    id: `matsya-${item.id}`,
    name: item.name,
    category: item.category,
    localName: item.marathiName ? `(${item.marathiName})` : '',
    subtitle: `${item.subtitle} • ${item.category}`,
    pricePerGrossKg: item.price_1kg,
    images: [
      defaultImage,
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80',
    ],
    cuts: specificData.cuts || [
      { id: 'standard-cut', name: item.standard_cut || 'Cleaned & RO Washed', description: 'Gutted, descaled, washed in pure RO water and ready to cook.', yieldPercentage: 78 },
      { id: 'curry-cut', name: 'Curry Cut (Steaks)', description: 'Sliced into thick, clean center-cut steaks for gravy.', yieldPercentage: 72 },
    ],
    weightPacks: item.price_500g ? [
      { gross: 500, label: '500g Pack (Serves 2–3)' },
      { gross: 1000, label: '1kg Pack (Serves 4–6)' },
    ] : [
      { gross: 1000, label: '1kg Pack (Serves 4–6)' },
    ],
    healthBenefits: specificData.healthBenefits || [
      { title: 'Lean Protein', value: '20g per 100g', description: 'Promotes muscle repair and long-lasting daily energy.' },
      { title: 'Rich in Omega-3', value: '1.2g EPA/DHA', description: 'Supports heart health and lowers inflammation.' },
    ],
  };
};

function ProductCard({ product, onSelectProduct }) {
  const [weight, setWeight] = useState(product.price_500g ? '500g' : '1kg');
  const addItem = useCartStore((state) => state.addItem);

  const price = weight === '500g' ? product.price_500g : product.price_1kg;
  const originalPrice = Math.round(price * 1.25);
  const displayImage = PRODUCT_SPECIFIC_DATA[product.id]?.image || 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=500&auto=format&fit=crop&q=60';

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
            {product.tag || 'Fresh Landing'}
          </span>
          <span className="text-[#FAF7EE]/70 text-xs font-medium flex items-center gap-1 group-hover:text-[#D5C582] transition-colors">
            <Eye className="w-3.5 h-3.5" /> Click to view Details
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
          <span className="text-sm font-semibold text-[#D5C582]">
            ({product.marathiName})
          </span>
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
            <span className="text-xs text-[#FAF7EE]/40 line-through">
              ₹{originalPrice}
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#C2542D] tracking-wider uppercase block">
            Save 20% Today
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (addItem) addItem(product, weight);
          }}
          className="py-2.5 px-4 rounded-xl bg-[#D5C582] hover:bg-[#E5D79E] text-[#1D184D] text-xs font-bold tracking-wider uppercase transition-all duration-150 active:scale-95 cursor-pointer"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function ProductGrid({ onSelectProduct }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    { key: 'ALL', label: 'All Catches' },
    { key: 'Premium Sea Fish', label: 'Premium Sea Fish' },
    { key: 'Prawns & Shellfish', label: 'Prawns & Shellfish' },
    { key: 'Daily Catch', label: 'Daily Catch' },
  ];

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory === 'ALL' || product.category === selectedCategory;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      (product.marathiName && product.marathiName.toLowerCase().includes(query)) ||
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
            <span>100% Edible Net Weight</span>
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
        {filteredProducts.length > 0 ? (
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