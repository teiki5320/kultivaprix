import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CTAKultiva } from '@/components/CTAKultiva';

export const revalidate = 86400; // 24h

async function getArticle(slug: string) {
  const { data } = await supabase.from('articles').select('*').eq('slug', slug).single();
  return data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = await getArticle(params.slug);
  if (!a) return {};
  const description = `${a.title} — repères pratiques, sans bla-bla. Kultivaprix.`;
  const canonical = `/guide/${a.slug}`;
  return {
    title: a.title,
    description,
    alternates: { canonical },
    openGraph: { title: a.title, description, url: canonical, type: 'article' },
  };
}

function mdToNodes(md: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  md.split('\n').forEach((line, i) => {
    if (line.startsWith('## ')) {
      nodes.push(
        <h2 key={i} className="font-display text-2xl font-bold mt-6" style={{ color: 'var(--brand-dark)' }}>
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith('> ')) {
      nodes.push(
        <blockquote
          key={i}
          className="pl-4 italic my-3"
          style={{ borderLeft: '4px solid var(--terracotta-deep)' }}
        >
          {line.slice(2)}
        </blockquote>,
      );
    } else if (line.startsWith('- ')) {
      nodes.push(<li key={i} className="ml-6 list-disc">{line.slice(2)}</li>);
    } else if (line.trim()) {
      nodes.push(<p key={i} className="my-2">{line}</p>);
    }
  });
  return nodes;
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const a = await getArticle(params.slug);
  if (!a) notFound();
  return (
    <div className="flex flex-col gap-8">
      <header>
        <span className="kicker">📖 Guide</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3 leading-tight">
          {a.title}
        </h1>
      </header>
      <article className="card-cream prose max-w-none">{mdToNodes(a.body_md)}</article>
      <CTAKultiva context={`guide-${a.slug}`} />
    </div>
  );
}
