import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Carte des marchands',
  description: 'Trouve un grainetier, une pépinière ou un producteur près de chez toi.',
};

export const revalidate = 86400;

export default async function CarteMarchandsPage() {
  const { data: merchants } = await supabase
    .from('merchants')
    .select('slug, name, base_url')
    .eq('enabled', true)
    .order('name');

  return (
    <div className="flex flex-col gap-8">
      <header className="text-center pt-4">
        <span className="kicker">🗺 Carte</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3">
          Marchands <em className="hero-em">jardinage</em>
        </h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-4">
          Pour l&apos;instant on liste les marchands en ligne suivis par Kultivaprix. Une carte
          interactive (grainetiers, pépinières, AMAP) arrive dès qu&apos;on a la donnée géocodée.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-3">
        {(merchants ?? []).map((m: any) => (
          <Link
            key={m.slug}
            href={`/marchand/${m.slug}`}
            className="card-cream no-underline transition hover:-translate-y-1 hover:shadow-leaf"
          >
            <div className="font-display font-bold text-lg text-fg">{m.name}</div>
            {m.base_url && (
              <div className="font-body text-xs text-fg-muted mt-1 truncate">
                {new URL(m.base_url).hostname}
              </div>
            )}
            <div className="font-body text-sm mt-3" style={{ color: 'var(--terracotta-deep)' }}>
              Voir le catalogue →
            </div>
          </Link>
        ))}
      </section>

      <aside className="card-cream">
        <span className="kicker">📍 Tu connais un grainetier local ?</span>
        <p className="font-body text-fg mt-2">
          Écris-nous depuis le pied de page : on suit en priorité les producteurs francophones
          (France, Belgique, Suisse, Afrique de l&apos;Ouest) qui partagent leurs prix en ligne.
        </p>
      </aside>
    </div>
  );
}
