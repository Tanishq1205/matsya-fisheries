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
    in_stock: item.in_stock,
    is_active: item.is_active,
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
      { gross: 500, label: '500g', netWeight: item.net_weight_500g || '~350g Net' },
      { gross: 1000, label: '1kg', netWeight: item.net_weight_1kg || '~700g Net' },
    ] : [
      { gross: 1000, label: '1kg', netWeight: item.net_weight_1kg || '~700g Net' },
    ],
  };
};
