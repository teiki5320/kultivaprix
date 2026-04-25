import type { Metadata } from 'next';
import { ProductCard } from '@/components/ProductCard';
import Link from 'next/link';
import { getPreferences } from '@/lib/preferences-server';
import { searchProducts, type SearchHit } from '@/lib/search';
import { detectTags } from '@/lib/parse-tags';
import { SearchAutocomplete } from '@/components/SearchAutocomplete';

export const revalidate = 0;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = (searchParams.q ?? '').trim();
  if (!q) {
    return {
      title: 'Recherche · graines, plants, outils',
      description: 'Cherche une variété, une marque ou un outil. Comparateur neutre, prix mis à jour plusieurs fois par jour.',
      alternates: { canonical: '/recherche' },
    };
  }
  return {
    title: `${q} : prix comparés`,
    description: `Toutes les offres de ${q} chez les marchands jardinage français, classées du moins cher au plus cher.`,
    alternates: { canonical: `/recherche?q=${encodeURIComponent(q)}` },
  };
}

interface Props {
  searchParams: {
    q?: string;
    bio?: string;
    fr?: string;
    max?: string;
    sort?: string;
  };
}

function parseFilters(sp: Props['searchParams']) {
  return {
    bio: sp.bio === '1',
    fr: sp.fr === '1',
    max: sp.max ? parseFloat(sp.max) : null,
    sort: (sp.sort ?? 'pertinence') as 'pertinence' | 'prix-asc' | 'prix-desc',
  };
}

function applyFilters(hits: SearchHit[], f: ReturnType<typeof parseFilters>): SearchHit[] {
  let out = hits;
  if (f.bio) out = out.filter((h) => detectTags(h.name, h.brand).bio);
  if (f.fr) out = out.filter((h) => detectTags(h.name, h.brand).origineFR);
  if (f.max != null) out = out.filter((h) => h.min_price != null && h.min_price <= f.max!);
  if (f.sort === 'prix-asc') out = [...out].sort((a, b) => (a.min_price ?? Infinity) - (b.min_price ?? Infinity));
  if (f.sort === 'prix-desc') out = [...out].sort((a, b) => (b.min_price ?? -Infinity) - (a.min_price ?? -Infinity));
  return out;
}

function urlWith(sp: Props['searchParams'], patch: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  const merged = { ...sp, ...patch };
  Object.entries(merged).forEach(([k, v]) => {
    if (v != null && v !== '' && v !== '0') params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `/recherche?${qs}` : '/recherche';
}

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? '').trim();
  const filters = parseFilters(searchParams);
  const all = await searchProducts(q, 60);
  const results = applyFilters(all, filters);
  const prefs = getPreferences();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <span className="kicker">🔎 Recherche</span>
        <h1 className="font-display text-4xl font-bold text-fg mt-3">
          Trouve le <em className="hero-em">meilleur prix</em>
        </h1>
      </header>

      <SearchAutocomplete initialValue={q} />

      {q && (
        <p className="font-body text-fg-muted">
          {results.length} résultat{results.length > 1 ? 's' : ''} pour <strong>«&nbsp;{q}&nbsp;»</strong>.
        </p>
      )}

      {q && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-body font-bold text-sm text-fg-muted mr-1">Filtres :</span>
          <Link
            href={urlWith(searchParams, { bio: filters.bio ? undefined : '1' })}
            className={`pill no-underline transition`}
            style={
              filters.bio
                ? { background: 'var(--brand)', color: 'white' }
                : { background: 'var(--cream)', color: 'var(--fg)' }
            }
          >
            🌿 Bio
          </Link>
          <Link
            href={urlWith(searchParams, { fr: filters.fr ? undefined : '1' })}
            className={`pill no-underline transition`}
            style={
              filters.fr
                ? { background: 'var(--terracotta-deep)', color: 'white' }
                : { background: 'var(--cream)', color: 'var(--fg)' }
            }
          >
            🇫🇷 Origine FR
          </Link>
          <span className="font-body font-bold text-sm text-fg-muted ml-2 mr-1">Trier :</span>
          {[
            { v: 'pertinence', l: 'Pertinence' },
            { v: 'prix-asc', l: 'Prix ↑' },
            { v: 'prix-desc', l: 'Prix ↓' },
          ].map((s) => (
            <Link
              key={s.v}
              href={urlWith(searchParams, { sort: s.v === 'pertinence' ? undefined : s.v })}
              className="pill no-underline transition"
              style={
                filters.sort === s.v
                  ? { background: 'var(--brand-dark)', color: 'white' }
                  : { background: 'var(--cream)', color: 'var(--fg)' }
              }
            >
              {s.l}
            </Link>
          ))}
        </div>
      )}

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {results.map((r) => (
          <ProductCard
            key={r.slug}
            slug={r.slug}
            name={r.name}
            imageUrl={r.image_url}
            minPrice={r.min_price}
            merchantCount={r.offer_count}
            currency={prefs.currency}
            light={prefs.light}
          />
        ))}
      </section>

      {!q && (
        <div className="card-cream">
          <p className="font-body text-fg">Tape une variété, une marque ou un outil pour démarrer.</p>
          <p className="mt-2 font-body text-fg-muted">
            Tu peux aussi <Link href="/quiz">faire le quiz « quoi planter ? »</Link> ou parcourir le{' '}
            <Link href="/que-semer/janvier">calendrier de semis</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
