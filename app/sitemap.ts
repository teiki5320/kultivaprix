import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { SITE_URL } from '@/lib/utils';
import { MONTHS } from '@/lib/calendar';
import { KITS } from '@/lib/kits';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';
const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/recherche`, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/quiz`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/budget`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/glossaire`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/kits`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/conseil`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/afrique-de-louest`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/calendrier-imprimable`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/carte-marchands`, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${SITE_URL}/ambassadeur`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/catalogue`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  KITS.forEach((k) => base.push({ url: `${SITE_URL}/kits/${k.slug}`, changeFrequency: 'weekly', priority: 0.5 }));

  MONTHS.forEach((m) => {
    base.push({ url: `${SITE_URL}/que-semer/${m.slug}`, changeFrequency: 'monthly', priority: 0.7 });
    base.push({ url: `${SITE_URL}/que-recolter/${m.slug}`, changeFrequency: 'monthly', priority: 0.6 });
  });

  const [{ data: cats }, { data: products }, { data: articles }, { data: merchants }, { data: catalog }] = await Promise.all([
    supabase.from('categories').select('slug'),
    supabase.from('products_master').select('slug, updated_at').not('slug', 'like', 'tmp-%').limit(50000),
    supabase.from('articles').select('slug, updated_at').limit(5000),
    supabase.from('merchants').select('slug').eq('enabled', true).limit(500),
    publicClient.from('species').select('slug, kind, updated_at').limit(2000),
  ]);

  cats?.forEach((c) => base.push({ url: `${SITE_URL}/${c.slug}`, changeFrequency: 'weekly', priority: 0.7 }));
  catalog?.forEach((c: any) => {
    base.push({
      url: `${SITE_URL}/${c.kind === 'species' ? 'espece' : 'accessoire'}/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });
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
