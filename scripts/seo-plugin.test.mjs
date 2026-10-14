import test from 'node:test';
import assert from 'node:assert/strict';
import { seoPlugin } from './seo-plugin.mjs';
test('an unassigned domain emits no fake canonical or sitemap', () => {
  const plugin = seoPlugin({});
  const files = [];
  plugin.generateBundle.call({ emitFile: file => files.push(file) });
  assert.deepEqual(files.map(file => file.fileName), ['robots.txt']);
  assert.ok(!plugin.transformIndexHtml().some(tag => tag.attrs.rel === 'canonical'));
});
test('a configured deployment emits absolute sitemap and preview URLs', () => {
  const plugin = seoPlugin({ VITE_SITE_URL: 'https://matsya.example/' });
  const files = [];
  plugin.generateBundle.call({ emitFile: file => files.push(file) });
  assert.match(files.find(file => file.fileName === 'sitemap.xml').source, /<loc>https:\/\/matsya.example\/<\/loc>/);
  assert.match(files.find(file => file.fileName === 'robots.txt').source, /Sitemap: https:\/\/matsya.example\/sitemap.xml/);
  assert.ok(plugin.transformIndexHtml().some(tag => tag.attrs.content === 'https://matsya.example/images/share-preview.png'));
});
