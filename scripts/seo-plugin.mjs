const description = 'Order fresh fish, prawns and seafood in Mumbai from Matsya Fisheries. Explore the daily catch and check delivery availability.';
export function seoPlugin(env) {
  const base = env.VITE_SITE_URL ? new URL(env.VITE_SITE_URL).origin : null;
  const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  return {
    name: 'matsya-seo',
    transformIndexHtml() {
      const tags = [
        { tag: 'meta', attrs: { name: 'description', content: description } },
        { tag: 'meta', attrs: { property: 'og:title', content: 'Matsya Fisheries | Fresh Seafood Delivery in Mumbai' } },
        { tag: 'meta', attrs: { property: 'og:description', content: description } },
        { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
        { tag: 'meta', attrs: { property: 'og:site_name', content: 'Matsya Fisheries' } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Matsya Fisheries — Fresh seafood delivery in Mumbai' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
      ];
      if (base) tags.push(
        { tag: 'link', attrs: { rel: 'canonical', href: `${base}/` } },
        { tag: 'meta', attrs: { property: 'og:url', content: `${base}/` } },
        { tag: 'meta', attrs: { property: 'og:image', content: `${base}/images/share-preview.png` } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: `${base}/images/share-preview.png` } },
      );
      return tags;
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nDisallow: /admin\nDisallow: /checkout\nDisallow: /track\n${base ? `Sitemap: ${base}/sitemap.xml\n` : ''}` });
      if (base) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(base)}/</loc></url></urlset>\n` });
    },
  };
}
