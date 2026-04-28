import type { Metadata } from 'next';
import Image from 'next/image';
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
      {/* Hero header — image + titre */}
      <section className="relative overflow-hidden rounded-b-[28px] -mx-4 md:-mx-6 -mt-4">
        <div className="relative h-[220px] md:h-[280px] w-full">
          <Image
            src="/etal-hero.png"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover"
          />
          {/* Voile sombre pour lisibilité */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)',
            }}
          />
          <div className="absolute inset-0 flex items-end px-6 md:px-10 pb-8">
            <div className="text-white">
              <h1
                className="font-display font-bold text-5xl md:text-6xl tracking-tight"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.45)' }}
              >
                L&apos;étal
              </h1>
              <p
                className="font-body font-medium text-base md:text-lg mt-1 opacity-90"
                style={{ textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}
              >
                {items.length} variétés à découvrir et planter
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Étal interactif */}
      <EtalGrid items={items} />

      <CTAKultiva context="home-etal" />
    </div>
  );
}
