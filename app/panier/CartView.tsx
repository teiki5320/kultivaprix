'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { readCart, removeFromCart, computeBasket, type ProductOffers } from '@/lib/cart';
import { convertAndFormat } from '@/lib/format-money';

export function CartView() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductOffers[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    setSlugs(readCart());
    function onChange() { setSlugs(readCart()); }
    window.addEventListener('kp_cart_change', onChange);
    return () => window.removeEventListener('kp_cart_change', onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (slugs.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/cart?slugs=${encodeURIComponent(slugs.join(','))}`)
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setProducts(j.products ?? []);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [slugs]);

  const basket = useMemo(() => computeBasket(products), [products]);

  function shareLink() {
    const url = new URL(window.location.href);
    url.pathname = '/panier/partage';
    url.search = '?items=' + encodeURIComponent(slugs.join(','));
    setShareUrl(url.toString());
    if (navigator.clipboard) navigator.clipboard.writeText(url.toString()).catch(() => {});
  }

  if (loading) return <div className="card-cream text-fg-muted">Chargement…</div>;

  if (slugs.length === 0) {
    return (
      <div className="card-cream text-center">
        <div className="text-5xl">🧺</div>
        <p className="font-body font-bold text-fg mt-3">Ton panier est vide.</p>
        <p className="font-body text-fg-muted text-sm mt-1">
          Ajoute des produits depuis les fiches pour calculer le meilleur split entre marchands.
        </p>
        <Link href="/recherche" className="btn-primary mt-4 inline-flex">Chercher des produits</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-3">
        {products.map((p) => (
          <div key={p.slug} className="card-cream flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
              style={{ background: 'var(--cream)' }}
            >
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="text-2xl" aria-hidden>🌱</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/produit/${p.slug}`} className="font-body font-bold text-sm text-fg no-underline hover:underline truncate block">
                {p.name}
              </Link>
              <div className="text-xs text-fg-muted mt-1">
                {p.offers.length} offre{p.offers.length > 1 ? 's' : ''}
              </div>
            </div>
            <button
              onClick={() => { removeFromCart(p.slug); setSlugs(readCart()); }}
              aria-label={`Retirer ${p.name} du panier`}
              className="text-fg-muted hover:text-fg text-xl px-2"
            >
              ✕
            </button>
          </div>
        ))}
      </section>

      <section className="card-cream">
        <span className="kicker">🪙 Total optimal</span>
        <h2 className="font-display text-3xl font-bold text-fg mt-2">
          {convertAndFormat(basket.total)}
        </h2>
        <p className="font-body text-sm text-fg-muted mt-1">
          Frais de port inclus quand le marchand les communique. Recalcul auto.
        </p>

        <div className="mt-5 space-y-4">
          {Array.from(basket.merchantBreakdown.entries()).map(([id, m]) => (
            <div key={id} className="rounded-xl p-4 bg-white border border-cream">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="font-display font-bold text-fg">
                  Chez{' '}
                  <Link href={`/marchand/${m.slug}`} className="no-underline hover:underline" style={{ color: 'var(--brand-dark)' }}>
                    {m.name}
                  </Link>
                </div>
                <div className="font-display font-bold text-lg" style={{ color: 'var(--terracotta-deep)' }}>
                  {convertAndFormat(m.subtotal + m.shipping)}
                </div>
              </div>
              <ul className="mt-2 space-y-1 font-body text-sm text-fg">
                {m.items.map((line) => (
                  <li key={line.product.slug} className="flex justify-between">
                    <span>{line.product.name}</span>
                    <span className="text-fg-muted">{convertAndFormat(line.unitPrice)}</span>
                  </li>
                ))}
                {m.shipping > 0 && (
                  <li className="flex justify-between text-fg-subtle text-xs italic mt-2 pt-2 border-t border-cream">
                    <span>Livraison</span>
                    <span>{convertAndFormat(m.shipping)}</span>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3 items-center">
        <button onClick={shareLink} className="btn-ghost">📤 Partager mon panier</button>
        {shareUrl && (
          <span className="font-body text-xs text-fg-muted truncate max-w-xs">
            Copié : {shareUrl}
          </span>
        )}
      </div>
    </div>
  );
}
