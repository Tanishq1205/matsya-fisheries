import { useEffect } from 'react';

export default function PageMetadata({ product, category, privatePage, policy }) {
  useEffect(() => {
    const home = 'Fresh Fish & Seafood Delivery in Mumbai | Matsya Fisheries';
    const title = privatePage ? `${privatePage} | Matsya Fisheries`
      : policy ? `${policy.replaceAll('-', ' ')} | Matsya Fisheries`
      : product ? `${product.name} Delivery in Mumbai | Matsya Fisheries`
      : category && category !== 'ALL' ? `${category} Delivery in Mumbai | Matsya Fisheries` : home;
    const description = product
      ? `Order ${product.name} from Matsya Fisheries in Mumbai. ${product.subtitle || 'Fresh seafood cleaned and prepared to your preferred cut.'}`
      : category && category !== 'ALL' ? `Shop ${category.toLowerCase()} from Matsya Fisheries. Fresh seafood prepared to order for delivery in serviceable Mumbai areas.`
      : 'Order fresh fish, prawns and seafood in Mumbai from Matsya Fisheries. Explore the daily catch, choose your cut and check delivery availability.';
    document.title = title;
    const meta = (name, value, property = false) => {
      const key = property ? 'property' : 'name';
      let element = document.head.querySelector(`meta[${key}="${name}"]`);
      if (!element) { element = document.createElement('meta'); element.setAttribute(key, name); document.head.append(element); }
      element.content = value;
    };
    meta('description', description);
    meta('robots', privatePage ? 'noindex, nofollow' : 'index, follow');
    meta('og:title', title, true); meta('og:description', description, true);
    meta('twitter:title', title); meta('twitter:description', description);
    const base = import.meta.env.VITE_SITE_URL;
    const previous = document.head.querySelector('link[rel="canonical"]');
    if (base && !privatePage) {
      const url = new URL(base);
      if (product) url.searchParams.set('product', product.id);
      else if (category && category !== 'ALL') url.searchParams.set('category', category);
      else if (policy) url.hash = policy;
      const link = previous || document.createElement('link');
      link.rel = 'canonical'; link.href = url.href; if (!previous) document.head.append(link);
      meta('og:url', url.href, true);
      meta('og:image', new URL('/images/share-preview.png', base).href, true);
      meta('twitter:image', new URL('/images/share-preview.png', base).href);
    } else previous?.remove();
  }, [product, category, privatePage, policy]);
  return null;
}
