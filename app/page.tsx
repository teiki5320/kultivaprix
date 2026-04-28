import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CTAKultiva } from '@/components/CTAKultiva';
import { EtalGrid, type EtalItem } from '@/components/EtalGrid';

export const revalidate = 21600;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';
const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

export const metadata: Metadata = {
  title: "L'étal Kultiva — toutes les espèces du potager",
  description:
    "Le catalogue complet des espèces du potager, des aromatiques aux fleurs comestibles, version web de l'étal de l'app Kultiva. Cherche, filtre, découvre.",
  alternates: { canonical: '/' },
};

async function getEtalItems(): Promise<EtalItem[]> {
  const { data } = await publicClient
    .from('species')
    .select('slug, kind, name, emoji, category, accessory_sub, image_url')
    .order('name');
  return (data ?? []) as EtalItem[];
}

export default async function HomePage() {
  const items = await getEtalItems();

  return (
    <div className="flex flex-col gap-10">
      <EtalGrid items={items} />
      <CTAKultiva context="home-etal" />
    </div>
  );
}
