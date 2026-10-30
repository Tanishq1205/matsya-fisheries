import { cleanCatalogCopy } from './productCopy.js';

export function productDiscount(price, mrp) {
  const amount = Number(price);
  const original = Number(mrp);
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(original) || original <= amount) {
    return { originalPrice: null, discountPercent: 0 };
  }
  return { originalPrice: original, discountPercent: Math.floor((original - amount) / original * 100) };
}

export function productCuts(product) {
  const options = [product?.cuts, product?.cut_options_detail, product?.cut_options];
  for (const source of options) {
    if (!Array.isArray(source)) continue;
    const cuts = source.map(cut => typeof cut === 'string' ? { name: cut.trim() } : cut)
      .filter(cut => typeof cut?.name === 'string' && cut.name.trim());
    if (cuts.length) return cuts;
  }
  return [{ name: product?.standard_cut || 'Cleaned', description: 'Prepared and cut to order.' }];
}

/**
 * Format database product row into standard payload for Product Details Modal
 */
export const formatForDetailsPage = (rawItem) => {
  const item = cleanCatalogCopy(rawItem);
  const defaultImage = item.image_url || 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=800&auto=format&fit=crop&q=80';
  const galleryImages = item.gallery_urls && Array.isArray(item.gallery_urls) && item.gallery_urls.length > 0
    ? item.gallery_urls
    : [defaultImage];

  return {
    id: item.id,
    in_stock: item.in_stock,
    is_active: item.is_active,
    name: item.name,
    category: item.category,
    marathiName: item.marathi_name || '',
    localName: item.marathi_name ? `(${item.marathi_name})` : '',
    subtitle: item.subtitle || '',
    badgeText: item.badge_text || '100% DOCK FRESH',
    landingOrigin: item.landing_origin || 'Cleaned',
    price_500g: item.price_500g,
    price_1kg: item.price_1kg,
    mrp_500g: item.mrp_500g,
    mrp_1kg: item.mrp_1kg,
    discountPercent: item.discount_percent ?? 0,
    images: [defaultImage, ...galleryImages.filter(img => img !== defaultImage)],
    cuts: productCuts(item),
    weightPacks: item.price_500g ? [
      { gross: 500, label: '500g', netWeight: item.net_weight_500g || '~350g Net' },
      { gross: 1000, label: '1kg', netWeight: item.net_weight_1kg || '~700g Net' },
    ] : [
      { gross: 1000, label: '1kg', netWeight: item.net_weight_1kg || '~700g Net' },
    ],
  };
};
