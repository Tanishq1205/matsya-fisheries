export function readCustomerDetails() {
  try {
    const value = JSON.parse(localStorage.getItem('matsya_customer_details') || 'null');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
