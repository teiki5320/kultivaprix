import { supabase } from '@/lib/supabase';
import { ReviewForm } from './ReviewForm';
import { formatRelativeFR } from '@/lib/format-relative';

interface Props {
  productId: string;
  productSlug: string;
  productName: string;
}

interface Review {
  id: string;
  display_name: string;
  region: string | null;
  rating: number;
  body: string;
  created_at: string;
}

export async function ReviewsSection({ productId, productSlug, productName }: Props) {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, display_name, region, rating, body, created_at')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(20);

  const list: Review[] = (reviews ?? []) as any;

  const avg = list.length ? list.reduce((a, b) => a + b.rating, 0) / list.length : null;

  return (
    <section>
      <span className="kicker kicker-terra">⭐ Avis jardiniers</span>
      <h2 className="font-display text-3xl font-bold mt-3 mb-4 text-fg">
        Ce qu&apos;en disent les jardinier·es
      </h2>

      {avg != null && (
        <div className="card-cream flex items-center gap-4 mb-4">
          <div className="font-display text-4xl font-bold" style={{ color: 'var(--terracotta-deep)' }}>
            {avg.toFixed(1).replace('.', ',')}
          </div>
          <div className="flex-1">
            <div className="text-2xl">{'★'.repeat(Math.round(avg))}{'☆'.repeat(5 - Math.round(avg))}</div>
            <div className="font-body text-sm text-fg-muted">
              {list.length} avis publié{list.length > 1 ? 's' : ''} · germination, goût, productivité
            </div>
          </div>
        </div>
      )}

      {list.length > 0 && (
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          {list.map((r) => (
            <article key={r.id} className="card-cream">
              <div className="flex items-center justify-between gap-2">
                <div className="font-body font-bold text-fg text-sm">
                  {r.display_name}
                  {r.region && <span className="text-fg-muted font-normal"> · {r.region}</span>}
                </div>
                <div className="text-sm" aria-label={`${r.rating} étoiles sur 5`}>
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </div>
              </div>
              <p className="font-body text-sm text-fg-muted mt-2 leading-relaxed">{r.body}</p>
              <div className="text-xs text-fg-subtle mt-2">{formatRelativeFR(r.created_at)}</div>
            </article>
          ))}
        </div>
      )}

      {list.length === 0 && (
        <div className="card-cream text-fg-muted text-sm mb-4">
          Pas encore d&apos;avis. Sois le premier à partager ton retour sur {productName}.
        </div>
      )}

      <ReviewForm productSlug={productSlug} productName={productName} />
    </section>
  );
}
