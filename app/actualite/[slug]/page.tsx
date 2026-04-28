import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { CTAKultiva } from '@/components/CTAKultiva';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const revalidate = 600;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';
const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false },
  db: { schema: 'public' },
});

interface Article {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image_url: string;
  video_url: string | null;
  tags: string[];
  published_at: string;
  updated_at: string;
}

async function getArticle(slug: string): Promise<Article | null> {
  const { data } = await publicClient
    .from('articles')
    .select('slug, title, excerpt, body, image_url, video_url, tags, published_at, updated_at')
    .eq('slug', slug)
    .maybeSingle();
  return (data as Article) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const a = await getArticle(params.slug);
  if (!a) return {};
  const description = a.excerpt.slice(0, 160);
  const canonical = `/actualite/${a.slug}`;
  return {
    title: a.title,
    description,
    alternates: { canonical },
    openGraph: { title: a.title, description, url: canonical, images: [a.image_url] },
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
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

/**
 * Rendu Markdown minimal — sans dep externe.
 * Supporte : titres ##/###, paragraphes, italique *…*, gras **…**, liens [t](url),
 * listes - /1., images ![alt](url), citations >.
 */
function renderMarkdown(md: string): JSX.Element[] {
  const blocks = md.split(/\n{2,}/);
  return blocks.map((blk, i) => renderBlock(blk.trim(), i));
}

function renderBlock(blk: string, key: number): JSX.Element {
  // Titre H2
  if (blk.startsWith('## ')) {
    return (
      <h2 key={key} className="font-display font-bold text-2xl md:text-3xl text-fg mt-6 mb-1">
        {renderInline(blk.slice(3))}
      </h2>
    );
  }
  // Titre H3
  if (blk.startsWith('### ')) {
    return (
      <h3 key={key} className="font-display font-bold text-xl text-fg mt-4 mb-1">
        {renderInline(blk.slice(4))}
      </h3>
    );
  }
  // Image: ![alt](url)
  const imgMatch = blk.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (imgMatch) {
    return (
      <figure key={key} className="my-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgMatch[2]}
          alt={imgMatch[1]}
          loading="lazy"
          className="rounded-2xl w-full"
        />
        {imgMatch[1] && (
          <figcaption className="font-body text-xs text-fg-muted text-center mt-2">
            {imgMatch[1]}
          </figcaption>
        )}
      </figure>
    );
  }
  // Liste à puces
  if (blk.split('\n').every((l) => /^[-*] /.test(l))) {
    return (
      <ul key={key} className="font-body text-fg leading-relaxed list-disc pl-6 space-y-1">
        {blk.split('\n').map((line, j) => (
          <li key={j}>{renderInline(line.replace(/^[-*] /, ''))}</li>
        ))}
      </ul>
    );
  }
  // Liste numérotée
  if (blk.split('\n').every((l) => /^\d+\.\s/.test(l))) {
    return (
      <ol key={key} className="font-body text-fg leading-relaxed list-decimal pl-6 space-y-1">
        {blk.split('\n').map((line, j) => (
          <li key={j}>{renderInline(line.replace(/^\d+\.\s/, ''))}</li>
        ))}
      </ol>
    );
  }
  // Citation
  if (blk.startsWith('> ')) {
    return (
      <blockquote
        key={key}
        className="border-l-4 pl-4 italic font-body text-fg-muted"
        style={{ borderColor: 'var(--terracotta-deep)' }}
      >
        {renderInline(blk.slice(2))}
      </blockquote>
    );
  }
  // Paragraphe
  return (
    <p key={key} className="font-body text-fg leading-relaxed">
      {renderInline(blk)}
    </p>
  );
}

function renderInline(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  // Pattern : [text](url) | **text** | *text*
  const regex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) {
      // lien
      const isExternal = /^https?:\/\//.test(m[3]);
      parts.push(
        <a
          key={key++}
          href={m[3]}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="font-bold text-brand-dark hover:underline"
        >
          {m[2]}
        </a>,
      );
    } else if (m[4]) {
      parts.push(<strong key={key++}>{m[5]}</strong>);
    } else if (m[6]) {
      parts.push(<em key={key++}>{m[7]}</em>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const a = await getArticle(params.slug);
  if (!a) notFound();

  const ytEmbed = a.video_url ? youtubeEmbedUrl(a.video_url) : null;

  return (
    <article className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      <Breadcrumbs
        crumbs={[
          { name: 'Actualités', href: '/actualites' },
          { name: a.title, href: `/actualite/${a.slug}` },
        ]}
      />

      {/* Image hero */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" />
      </div>

      {/* En-tête */}
      <header className="flex flex-col gap-3">
        {a.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {a.tags.map((t) => (
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
          {a.title}
        </h1>
        <time className="font-body text-sm text-fg-muted" dateTime={a.published_at}>
          Publié le {formatDate(a.published_at)}
        </time>
      </header>

      {/* Excerpt en lead */}
      <p className="font-body text-lg text-fg leading-relaxed font-medium">{a.excerpt}</p>

      {/* Vidéo */}
      {ytEmbed && (
        <div className="aspect-video w-full overflow-hidden rounded-3xl bg-black">
          <iframe
            src={ytEmbed}
            title={a.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      )}
      {a.video_url && !ytEmbed && (
        <a
          href={a.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary self-start"
        >
          ▶ Voir la vidéo
        </a>
      )}

      {/* Corps de l'article */}
      <div className="flex flex-col gap-3">{renderMarkdown(a.body)}</div>

      <CTAKultiva context={`article-${a.slug}`} />
    </article>
  );
}
