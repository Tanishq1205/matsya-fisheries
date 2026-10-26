export function earliestPreorderDate(now = new Date(), noticeDays = 1) {
  if (!Number.isInteger(noticeDays) || noticeDays < 1) throw new Error('Preorders are temporarily unavailable.');
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(now.getTime() + noticeDays * 86400000));
  const value = type => parts.find(part => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function validatePreorderDate(date, noticeDays = 1, now = new Date()) {
  const minimum = earliestPreorderDate(now, noticeDays);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || Number.isNaN(Date.parse(date))
    || new Date(date).toISOString().slice(0, 10) !== date || date < minimum) {
    throw new Error(`Choose a delivery date on or after ${minimum}.`);
  }
}

export function isPreorderProduct(product) {
  return product?.category === 'Premium Sea Fish' && product.is_active === true && product.in_stock === true;
}

export function formatDeliveryDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '') || Number.isNaN(Date.parse(value))) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(`${value}T00:00:00+05:30`));
}
