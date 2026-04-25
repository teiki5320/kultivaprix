import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdminRequest } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase';

export const metadata = { title: 'Admin · dashboard', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

async function getStats() {
  const sb = supabaseAdmin();
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();

  const [{ count: products }, { count: offers }, { count: clicks }, { count: alerts }, { count: pendingReviews }, { count: subscribers }] =
    await Promise.all([
      sb.from('products_master').select('*', { count: 'exact', head: true }),
      sb.from('offers').select('*', { count: 'exact', head: true }),
      sb.from('clicks').select('*', { count: 'exact', head: true }).gte('clicked_at', dayAgo),
      sb.from('price_alerts').select('*', { count: 'exact', head: true }),
      sb.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).is('unsubscribed_at', null),
    ]);

  // Stale offers (last_seen > 48h)
  const staleSince = new Date(Date.now() - 48 * 3_600_000).toISOString();
  const { count: stale } = await sb.from('offers').select('*', { count: 'exact', head: true }).lt('last_seen_at', staleSince);

  return {
    products: products ?? 0,
    offers: offers ?? 0,
    clicksLast24h: clicks ?? 0,
    alerts: alerts ?? 0,
    pendingReviews: pendingReviews ?? 0,
    subscribers: subscribers ?? 0,
    staleOffers: stale ?? 0,
  };
}

export default async function AdminDashboard() {
  if (!isAdminRequest()) redirect('/admin/login');
  const stats = await getStats();

  const tiles = [
    { label: 'Produits suivis', value: stats.products, href: '/recherche' },
    { label: 'Offres actives', value: stats.offers, href: null },
    { label: 'Clics 24 h', value: stats.clicksLast24h, href: null },
    { label: 'Alertes prix', value: stats.alerts, href: null },
    { label: 'Avis en attente', value: stats.pendingReviews, href: '/admin/reviews' },
    { label: 'Newsletter (actifs)', value: stats.subscribers, href: null },
    { label: 'Offres > 48 h sans MAJ', value: stats.staleOffers, href: null },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <span className="kicker">🛠 Admin</span>
        <h1 className="font-display text-4xl font-bold text-fg mt-3">Tableau de bord</h1>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((t) => {
          const card = (
            <div className="card-cream text-center">
              <div className="font-display text-3xl font-bold text-brand-dark">
                {t.value.toLocaleString('fr-FR')}
              </div>
              <div className="font-body text-sm text-fg-muted mt-1">{t.label}</div>
            </div>
          );
          return t.href ? (
            <Link key={t.label} href={t.href} className="no-underline">{card}</Link>
          ) : (
            <div key={t.label}>{card}</div>
          );
        })}
      </section>

      <section className="card-cream">
        <h2 className="font-display text-xl font-bold text-fg mb-2">Outils</h2>
        <ul className="font-body text-sm text-fg space-y-2">
          <li>· <Link href="/admin/reviews" style={{ color: 'var(--terracotta-deep)' }}>Modérer les avis</Link> ({stats.pendingReviews} en attente)</li>
          <li>· <a href="/api/v1/products" style={{ color: 'var(--terracotta-deep)' }} target="_blank" rel="noopener noreferrer">API publique : produits</a></li>
          <li>· <a href="/api/v1/offers?productSlug=…" style={{ color: 'var(--terracotta-deep)' }}>API publique : offres</a></li>
        </ul>
      </section>
    </div>
  );
}
