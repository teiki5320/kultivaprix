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
  return {
    title: a.title,
    description: `${a.title} — repères pratiques, sans bla-bla. Kultivaprix.`,
  };
}

function mdToNodes(md: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  md.split('\n').forEach((line, i) => {
    if (line.startsWith('## ')) {
      nodes.push(
        <h2 key={i} className="font-display text-2xl font-extrabold text-kawaii-green-600 mt-6">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith('> ')) {
      nodes.push(
        <blockquote key={i} className="border-l-4 border-kawaii-pink-300 pl-4 italic my-3">
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
    <div className="flex flex-col gap-6">
      <header>
        <span className="pill bg-kawaii-pink-100 text-kawaii-pink-600">📖 Guide</span>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-kawaii-green-600 mt-2">
          {a.title}
        </h1>
      </header>
      <article className="card-kawaii prose max-w-none">{mdToNodes(a.body_md)}</article>
      <CTAKultiva context={`guide-${a.slug}`} />
    </div>
  );
}
