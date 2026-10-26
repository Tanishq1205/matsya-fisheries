// Keep older catalog and order wording out of customer-facing text without
// changing saved order contents, cart identifiers, or checkout retry payloads.
export function cleanProductText(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/\bcleaned\s*(?:&|and)\s*RO[\s-]+washed\b/gi, 'Cleaned')
    .replace(/\bcleaned\s+(?:in|with)\s+(?:pure\s+)?(?:RO|reverse[\s-]+osmosis)[\s-]+water\b/gi, 'cleaned')
    .replace(/\bwashed\s+(?:in|with)\s+(?:pure\s+)?(?:RO|reverse[\s-]+osmosis)[\s-]+water\b/gi, 'washed')
    .replace(/\b(?:100%\s+)?RO[\s-]+washed\b/gi, 'cleaned')
    .replace(/\b(?:pure\s+)?(?:RO|reverse[\s-]+osmosis)[\s-]+water\s+processing\b/gi, 'preparation')
    .replace(/\b(?:pure\s+)?(?:RO|reverse[\s-]+osmosis)[\s-]+water\b/gi, 'water');
}

export function cleanCatalogCopy(data) {
  if (Array.isArray(data)) return data.map(cleanCatalogCopy);
  if (!data || typeof data !== 'object') return data;
  const textFields = ['name', 'marathi_name', 'subtitle', 'description', 'standard_cut', 'landing_origin', 'badge_text'];
  const product = { ...data };
  for (const field of textFields) {
    if (typeof product[field] === 'string') product[field] = cleanProductText(product[field]);
  }
  if (Array.isArray(product.cut_options)) product.cut_options = product.cut_options.map(cleanProductText);
  if (Array.isArray(product.cut_options_detail)) product.cut_options_detail = product.cut_options_detail.map(cleanCatalogCopy);
  return product;
}
