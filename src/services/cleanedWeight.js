// Owner-supplied approximate ranges, based on ordered weight before cleaning.
export function cleanedWeightRange(product, grossGrams, quantity = 1) {
  if (!(grossGrams > 0) || !Number.isInteger(quantity) || quantity < 1) return null;
  const name = product?.name || '';
  const ratio = /\b(surmai|rawas|bombil)\b/i.test(name) ? [0.7, 0.8]
    : /\b(prawns?|shrimps?|sardines?|squids?)\b/i.test(name) ? [0.5, 0.7] : null;
  return ratio ? ratio.map(value => Math.round(grossGrams * quantity * value)) : null;
}

export function formatCleanedWeight(range) {
  return range ? `${range[0].toLocaleString('en-IN')}–${range[1].toLocaleString('en-IN')}g` : '';
}
