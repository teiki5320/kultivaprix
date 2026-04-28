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
    { url: `${SITE_URL}/catalogue`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/app`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/bilan`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/quiz`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/glossaire`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/kits`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/conseil`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/afrique-de-louest`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/calendrier-imprimable`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/actualites`, changeFrequency: 'weekly', priority: 0.6 },
  ];

  KITS.forEach((k) => base.push({ url: `${SITE_URL}/kits/${k.slug}`, changeFrequency: 'weekly', priority: 0.5 }));

  MONTHS.forEach((m) => {
    base.push({ url: `${SITE_URL}/que-semer/${m.slug}`, changeFrequency: 'monthly', priority: 0.7 });
    base.push({ url: `${SITE_URL}/que-recolter/${m.slug}`, changeFrequency: 'monthly', priority: 0.6 });
  });

  const [{ data: articles }, { data: catalog }] = await Promise.all([
    supabase.from('articles').select('slug, updated_at').limit(5000),
    publicClient.from('species').select('slug, kind, updated_at').limit(2000),
  ]);

  catalog?.forEach((c: any) => {
    base.push({
      url: `${SITE_URL}/${c.kind === 'species' ? 'espece' : 'accessoire'}/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });
  articles?.forEach((a: any) =>
    base.push({
      url: `${SITE_URL}/actualite/${a.slug}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.6,
    }),
  );

  return base;
}
