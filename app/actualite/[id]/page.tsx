import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { CTAKultiva } from '@/components/CTAKultiva';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const revalidate = 600; // 10 min

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';
const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

interface NewsItem {
  id: string;
  title: string;
  caption: string;
  image_url: string;
  article_url: string | null;
  video_url: string | null;
  tags: string[];
  published_at: string;
}

async function getNews(id: string): Promise<NewsItem | null> {
  const { data } = await publicClient
    .from('news_items')
    .select('id, title, caption, image_url, article_url, video_url, tags, published_at')
    .eq('id', id)
    .maybeSingle();
  return (data as NewsItem) ?? null;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const n = await getNews(params.id);
  if (!n) return {};
  const description = n.caption.slice(0, 160);
  const canonical = `/actualite/${n.id}`;
  return {
    title: n.title,
    description,
    alternates: { canonical },
    openGraph: { title: n.title, description, url: canonical, images: [n.image_url] },
  };
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

function youtubeEmbedUrl(url: string): string | null {
  // Match youtu.be/<id> ou youtube.com/watch?v=<id> ou youtube.com/shorts/<id>
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export default async function ActualitePage({ params }: { params: { id: string } }) {
  const n = await getNews(params.id);
  if (!n) notFound();

  const ytEmbed = n.video_url ? youtubeEmbedUrl(n.video_url) : null;

  return (
    <article className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <Breadcrumbs
        crumbs={[
          { name: 'Actualités', href: '/actualites' },
          { name: n.title, href: `/actualite/${n.id}` },
        ]}
      />

      {/* Image hero */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={n.image_url}
          alt={n.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* En-tête */}
      <header className="flex flex-col gap-3">
        {n.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {n.tags.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-xs font-body font-bold tracking-wide bg-cream text-fg"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <h1 className="font-display font-bold text-3xl md:text-4xl text-fg tracking-tight leading-tight">
          {n.title}
        </h1>
        <time className="font-body text-sm text-fg-muted" dateTime={n.published_at}>
          Publié le {formatDate(n.published_at)}
        </time>
      </header>

      {/* Caption en lead */}
      <p className="font-body text-lg text-fg leading-relaxed whitespace-pre-line">
        {n.caption}
      </p>

      {/* Vidéo */}
      {ytEmbed && (
        <div className="aspect-video w-full overflow-hidden rounded-3xl bg-black">
          <iframe
            src={ytEmbed}
            title={n.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      )}
      {n.video_url && !ytEmbed && (
        <a
          href={n.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary self-start"
        >
          ▶ Voir la vidéo
        </a>
      )}

      {/* Lien article externe (si défini et n'est pas déjà cette page) */}
      {n.article_url && !n.article_url.includes(`/actualite/${n.id}`) && (
        <a
          href={n.article_url}
          target={/^https?:\/\//.test(n.article_url) ? '_blank' : undefined}
          rel={/^https?:\/\//.test(n.article_url) ? 'noopener noreferrer' : undefined}
          className="font-body font-bold text-brand-dark hover:underline"
        >
          Lire l’article complet →
        </a>
      )}

      <CTAKultiva context={`actualite-${n.id}`} />
    </article>
  );
}
