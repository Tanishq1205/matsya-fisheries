import { supabase } from '../lib/supabaseClient';

/**
 * Fetch all active products from Supabase
 */
export const getAllProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching all products:', error.message);
    return { data: [], error: error.message };
  }
};

/**
 * Fetch products by specific category
 * @param {string} category 
 */
export const getProductsByCategory = async (category) => {
  try {
    let query = supabase.from('products').select('*').eq('is_active', true);

    if (category && category.toLowerCase() !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching products for category ${category}:`, error.message);
    return { data: [], error: error.message };
  }
};

/**
 * Fetch a single product by ID
 * @param {string} id 
 */
export const getProductById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching product ID ${id}:`, error.message);
    return { data: null, error: error.message };
  }
};

/**
 * Fetch featured spotlight products (products with active badges or tagged items)
 */
export const getFeaturedProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .not('badge_text', 'is', null)
      .limit(6);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching featured products:', error.message);
    return { data: [], error: error.message };
  }
};

/**
 * Fetch related products in the same category excluding current product
 * @param {string} category 
 * @param {string} currentProductId 
 * @param {number} limit 
 */
export const getRelatedProducts = async (category, currentProductId, limit = 4) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .neq('id', currentProductId)
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching related products:', error.message);
    return { data: [], error: error.message };
  }
};