import { supabase } from '../lib/supabaseClient';

export async function getDeliveryQuote(pincode) {
  const { data, error } = await supabase.from('serviceable_pincodes')
    .select('pincode, status, delivery_zones!inner(charge_paise)')
    .eq('pincode', pincode).maybeSingle();
  if (error) throw error;
  const charge = data?.delivery_zones?.charge_paise;
  if (!data || !['Available', 'Available (legacy)'].includes(data.status)
    || !Number.isInteger(charge) || charge < 0) return null;
  return { pincode, fee: charge / 100 };
}
