import { useEffect, useId, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { earliestPreorderDate, isPreorderProduct, validatePreorderDate } from '../../services/preorder';
import { getPreorderNoticeDays } from '../../services/productService';

export default function PremiumPreorder({ products = [] }) {
  const prefix = useId();
  const [productId, setProductId] = useState('');
  const [weight, setWeight] = useState('500g');
  const [cut, setCut] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState('');
  const [noticeDays, setNoticeDays] = useState(null);
  const [setupError, setSetupError] = useState('');
  const [error, setError] = useState('');
  const addItem = useCartStore(state => state.addItem);
  const openCart = useCartStore(state => state.openCart);
  const available = products.filter(isPreorderProduct);
  const product = available.find(item => item.id === productId) || available[0];
  const pack = weight === '500g' && product?.price_500g > 0 ? '500g' : '1kg';
  const price = Number(pack === '500g' ? product?.price_500g : product?.price_1kg);
  const cuts = product?.cuts?.map(item => item.name) || product?.cut_options_detail?.map(item => item.name) || [];
  const choices = cuts.length ? cuts : [product?.standard_cut || 'Cleaned'];
  const selectedCut = choices.includes(cut) ? cut : choices[0];
  useEffect(() => {
    let cancelled = false;
    getPreorderNoticeDays().then(days => { if (!cancelled) setNoticeDays(days); })
      .catch(problem => { if (!cancelled) setSetupError(problem.message); });
    return () => { cancelled = true; };
  }, []);
  const submit = event => {
    event.preventDefault();
    setError('');
    try {
      validatePreorderDate(date, noticeDays);
      if (!product || !Number.isFinite(price) || price <= 0) throw new Error('Choose an available fish and pack.');
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) throw new Error('Choose between 1 and 999 packs.');
      const added = addItem({ ...product, cut: selectedCut, image: product.images?.[0] || product.image_url }, pack, selectedCut, quantity, { deliveryDate: date, noticeDays });
      if (added) openCart();
      else setError('Complete or clear your current basket before starting a different delivery.');
    } catch (problem) { setError(problem.message); }
  };
  const fieldClass = 'mt-2 w-full rounded-xl border border-[#1D184D]/20 bg-white p-3 text-sm font-normal text-[#1D184D] focus:outline-none focus:ring-2 focus:ring-[#D5C582]';
  return (
    <section aria-labelledby={`${prefix}-title`} className="rounded-2xl border border-[#D5C582] bg-white/80 p-5 sm:p-6 text-[#1D184D] select-text">
      <p className="text-[10px] uppercase tracking-widest font-bold text-[#C2542D] mb-2">Plan your next catch</p>
      <h3 id={`${prefix}-title`} className="text-xl font-bold">Premium fish, by preorder</h3>
      <p className="text-sm leading-relaxed mt-2">Choose your premium fish and delivery date. Order at the listed price and pay on delivery.</p>
      <details className="mt-4">
        <summary className="cursor-pointer font-bold text-sm underline underline-offset-4 py-2">Pre-order for a later date</summary>
        {setupError ? <p role="status" className="text-sm mt-4">{setupError}</p> : !noticeDays ? <p className="text-sm mt-4">Checking preorder availability...</p> : !available.length ? <p className="text-sm mt-4">No premium fish are available for preorder right now.</p> : (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-xs font-semibold" htmlFor={`${prefix}-fish`}>Fish or variety
                <select id={`${prefix}-fish`} value={product.id} onChange={event => { setProductId(event.target.value); setCut(''); setWeight('500g'); }} className={fieldClass}>
                  {available.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold" htmlFor={`${prefix}-weight`}>Pack size before cleaning
                <select id={`${prefix}-weight`} value={pack} onChange={event => setWeight(event.target.value)} className={fieldClass}>
                  {product.price_500g > 0 && <option value="500g">500g</option>}
                  {product.price_1kg > 0 && <option value="1kg">1kg</option>}
                </select>
              </label>
              <label className="text-xs font-semibold" htmlFor={`${prefix}-quantity`}>Number of packs
                <input id={`${prefix}-quantity`} type="number" inputMode="numeric" required min="1" max="999" step="1" value={quantity} onChange={event => setQuantity(Number(event.target.value))} className={fieldClass} />
              </label>
              <label className="text-xs font-semibold" htmlFor={`${prefix}-cut`}>Fish cut
                <select id={`${prefix}-cut`} value={selectedCut} onChange={event => setCut(event.target.value)} className={fieldClass}>
                  {choices.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold sm:col-span-2" htmlFor={`${prefix}-date`}>Delivery date
                <input id={`${prefix}-date`} type="date" required min={earliestPreorderDate(new Date(), noticeDays)} value={date} onChange={event => setDate(event.target.value)} className={fieldClass} />
              </label>
            </div>
            <p className="text-xs leading-relaxed text-[#1D184D]/70">Order at least {noticeDays} {noticeDays === 1 ? 'day' : 'days'} ahead. Delivery availability and charges are checked using your PIN code at checkout. Place regular orders in a separate basket.</p>
            <p className="text-sm font-bold" aria-live="polite">{quantity} × {pack} · ₹{Number.isFinite(price) ? (price * quantity).toLocaleString('en-IN') : '—'} before delivery</p>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" className="flex items-center justify-center gap-2 rounded-full bg-[#1D184D] text-[#D5C582] px-5 py-3 text-sm font-bold w-full sm:w-auto">
              <ShoppingBag size={18} aria-hidden="true" /> Add preorder to basket
            </button>
          </form>
        )}
      </details>
    </section>
  );
}
