import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { CTAKultiva } from '@/components/CTAKultiva';

export const revalidate = 600; // 10 min — actus fraîches mais pas live

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';

const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

export const metadata: Metadata = {
  title: 'Actualités · Kultiva',
  description:
    "Toutes les actualités Kultiva : conseils de saison, nouvelles fonctionnalités de l'app, dossiers jardin et coups de cœur de l'équipe.",
  alternates: { canonical: '/actualites' },
};

interface NewsItem {
  id: string;
  title: string;
  caption: string;
  image_url: string;
  article_url: string | null;
  video_url: string | null;
  tags: string[];
  priority: number;
  published_at: string;
}

async function getNews(): Promise<NewsItem[]> {
  const { data } = await publicClient
    .from('news_items')
    .select('id, title, caption, image_url, article_url, video_url, tags, priority, published_at')
    .order('priority', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(50);
  return (data ?? []) as NewsItem[];
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export default async function ActualitesPage() {
  const items = await getNews();

  return (
    <div className="flex flex-col gap-10">
      <header className="text-center pt-4">
        <span className="kicker">📰 Actualités</span>
        <h1 className="font-display font-bold text-4xl md:text-5xl text-fg mt-3 tracking-tight">
          Le <em className="hero-em">fil Kultiva</em>
        </h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-4">
          Conseils de saison, dossiers, coups de cœur et nouveautés de l&apos;app — la même chose
          que tu vois dans l&apos;app Kultiva, mais en grand format pour ton ordi.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="card-cream text-center py-12">
          <div className="text-5xl">🌱</div>
          <p className="font-display font-bold text-xl text-fg mt-4">Pas encore d&apos;actu !</p>
          <p className="font-body text-fg-muted mt-2 max-w-md mx-auto">
            On prépare les premiers articles. Ouvre l&apos;app Kultiva pour voir les nouveautés
            quotidiennes en attendant.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((n) => (
            <NewsCard key={n.id} item={n} />
          ))}
        </ul>
      )}

      <CTAKultiva context="actualites" />
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const isExternal = item.article_url && /^https?:\/\//.test(item.article_url);
  const href = item.article_url ?? item.video_url ?? null;
  const cardInner = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
        {item.video_url && (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.15)' }}
          >
            <span
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white"
              style={{ background: 'rgba(0,0,0,0.55)' }}
            >
              ▶
            </span>
          </div>
        )}
        {item.tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-full text-[11px] font-body font-bold tracking-wide bg-white/90 text-fg"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-2">
        <h2 className="font-display font-bold text-lg text-fg leading-snug">{item.title}</h2>
        <p className="font-body text-sm text-fg-muted leading-relaxed">{item.caption}</p>
        <div className="flex items-center justify-between mt-2">
          <time className="font-body text-xs text-fg-muted" dateTime={item.published_at}>
            {formatDate(item.published_at)}
          </time>
          {href && (
            <span className="font-body text-xs font-bold text-brand-dark">
              {item.video_url ? 'Voir la vidéo' : 'Lire l’article'} →
            </span>
          )}
        </div>
      </div>
    </>
  );

  const className =
    'group block rounded-3xl overflow-hidden bg-white border-2 border-cream hover:border-brand transition shadow-sm hover:shadow-md';

  if (href) {
    return (
      <li>
        <a
          href={href}
          target={isExternal || item.video_url ? '_blank' : undefined}
          rel={isExternal || item.video_url ? 'noopener noreferrer' : undefined}
          className={className}
        >
          {cardInner}
        </a>
      </li>
    );
  }
  return <li className={className}>{cardInner}</li>;
}
