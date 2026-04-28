import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CTAKultiva } from '@/components/CTAKultiva';
import { BilanClient, type SpeciesOption } from './BilanClient';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: 'Bilan · le prix de revient de ton potager',
  description:
    "Calcule combien ton potager t'a fait économiser : journal de récolte avec prix marché de référence, totaux automatiques, données privées sur ton navigateur.",
  alternates: { canonical: '/bilan' },
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';
const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

async function getSpeciesOptions(): Promise<SpeciesOption[]> {
  const { data } = await publicClient
    .from('species')
    .select('slug, name, emoji, category, kind')
    .eq('kind', 'species')
    .order('name');
  return ((data ?? []) as Array<SpeciesOption & { kind: string }>).map(({ kind, ...rest }) => rest);
}

export default async function BilanPage() {
  const speciesOptions = await getSpeciesOptions();

  return (
    <div className="flex flex-col gap-10">
      <header className="text-center pt-4">
        <span className="kicker">💰 Bilan</span>
        <h1 className="font-display font-bold text-4xl md:text-5xl text-fg mt-3 tracking-tight">
          Le <em className="hero-em">prix de revient</em> de ton potager
        </h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-4">
          Note tes récoltes au fur et à mesure : on multiplie chaque ligne par le prix grande
          surface équivalent, et tu vois combien tu économises sur tes courses.
        </p>
      </header>

      <BilanClient speciesOptions={speciesOptions} />

      <CTAKultiva context="bilan" />
    </div>
  );
}
