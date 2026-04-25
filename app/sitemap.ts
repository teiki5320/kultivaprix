import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { SITE_URL } from '@/lib/utils';
import { MONTHS } from '@/lib/calendar';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/recherche`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/glossaire`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Seasonal landings (semer + récolter, 12 months each)
  MONTHS.forEach((m) => {
    base.push({ url: `${SITE_URL}/que-semer/${m.slug}`, changeFrequency: 'monthly', priority: 0.7 });
    base.push({ url: `${SITE_URL}/que-recolter/${m.slug}`, changeFrequency: 'monthly', priority: 0.6 });
  });

  const [{ data: cats }, { data: products }, { data: articles }, { data: merchants }] = await Promise.all([
    supabase.from('categories').select('slug'),
    supabase.from('products_master').select('slug, updated_at').not('slug', 'like', 'tmp-%').limit(50000),
    supabase.from('articles').select('slug, updated_at').limit(5000),
    supabase.from('merchants').select('slug').eq('enabled', true).limit(500),
  ]);

  cats?.forEach((c) => base.push({ url: `${SITE_URL}/${c.slug}`, changeFrequency: 'weekly', priority: 0.7 }));
  merchants?.forEach((mm: any) =>
    base.push({ url: `${SITE_URL}/marchand/${mm.slug}`, changeFrequency: 'weekly', priority: 0.5 }),
  );
  products?.forEach((p: any) =>
    base.push({
      url: `${SITE_URL}/produit/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: 'daily',
      priority: 0.8,
    }),
  );
  articles?.forEach((a: any) =>
    base.push({
      url: `${SITE_URL}/guide/${a.slug}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.6,
    }),
  );

  return base;
}
