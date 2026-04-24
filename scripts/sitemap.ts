/**
 * Génère /public/sitemap.xml à partir de la base Supabase.
 * Déclenché par le workflow sitemap-daily.yml (et aussi disponible via app/sitemap.ts
 * en mode dynamique, mais un fichier statique évite le cold-start).
 */
import { supabaseAdmin } from '../lib/supabase';
import { writeFile, mkdir } from 'node:fs/promises';
import { SITE_URL } from '../lib/utils';

async function main() {
  const sb = supabaseAdmin();
  const urls: string[] = [SITE_URL, `${SITE_URL}/recherche`];

  const { data: cats } = await sb.from('categories').select('slug, sort_order');
  cats?.forEach((c) => urls.push(`${SITE_URL}/${c.slug}`));

  const { data: products } = await sb
    .from('products_master')
    .select('slug')
    .not('slug', 'like', 'tmp-%')
    .limit(50000);
  products?.forEach((p) => urls.push(`${SITE_URL}/produit/${p.slug}`));

  const { data: articles } = await sb.from('articles').select('slug').limit(5000);
  articles?.forEach((a) => urls.push(`${SITE_URL}/guide/${a.slug}`));

  const now = new Date().toISOString();
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${u}</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq></url>`,
      )
      .join('\n') +
    `\n</urlset>`;

  await mkdir('public', { recursive: true });
  await writeFile('public/sitemap.xml', xml, 'utf8');
  await writeFile(
    'public/robots.txt',
    `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`,
    'utf8',
  );
  // eslint-disable-next-line no-console
  console.log(`Wrote ${urls.length} URLs to public/sitemap.xml`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('[sitemap] fatal', e);
    process.exit(1);
  });
}
