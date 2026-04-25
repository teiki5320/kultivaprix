import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAdminRequest } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase';
import { ReviewModerationActions } from './ReviewModerationActions';

export const metadata = { title: 'Admin · modération avis', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  if (!isAdminRequest()) redirect('/admin/login');

  const sb = supabaseAdmin();
  const { data: pending } = await sb
    .from('reviews')
    .select('id, display_name, region, rating, body, created_at, products_master(slug, name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <span className="kicker">🛠 Admin · avis</span>
        <h1 className="font-display text-4xl font-bold text-fg mt-3">À modérer</h1>
        <p className="font-body text-fg-muted mt-2">{(pending ?? []).length} avis en attente.</p>
      </header>

      <section className="space-y-3">
        {(pending ?? []).map((r: any) => (
          <article key={r.id} className="card-cream">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div>
                <div className="font-body font-bold text-fg text-sm">
                  {r.display_name}
                  {r.region && <span className="text-fg-muted font-normal"> · {r.region}</span>}
                </div>
                <Link href={`/produit/${r.products_master?.slug}`} className="text-xs" style={{ color: 'var(--terracotta-deep)' }}>
                  {r.products_master?.name} ↗
                </Link>
              </div>
              <div className="text-sm">
                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
              </div>
            </div>
            <p className="font-body text-sm text-fg whitespace-pre-line leading-relaxed">{r.body}</p>
            <div className="mt-3 flex gap-2">
              <ReviewModerationActions id={r.id} />
            </div>
          </article>
        ))}
        {(pending ?? []).length === 0 && (
          <div className="card-cream text-center text-fg-muted">Rien à modérer 🌿</div>
        )}
      </section>
    </div>
  );
}
