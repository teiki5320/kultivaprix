import { formatPrice } from '@/lib/utils';

interface OfferRow {
  offer_id: string;
  merchant_name: string;
  merchant_slug: string;
  title: string;
  price: number | null;
  currency: string;
  shipping_cost: number | null;
  in_stock: boolean;
  last_seen_at: string;
}

export function PriceTable({ offers }: { offers: OfferRow[] }) {
  const sorted = [...offers].sort((a, b) => (a.price ?? 9e9) - (b.price ?? 9e9));
  return (
    <div
      className="rounded-bubble overflow-hidden bg-white"
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-body">
          <thead style={{ background: 'var(--cream)' }} className="text-fg">
            <tr>
              <th className="text-left px-5 py-4 font-display font-bold">Marchand</th>
              <th className="text-left px-5 py-4 font-display font-bold">Produit</th>
              <th className="text-right px-5 py-4 font-display font-bold">Prix</th>
              <th className="text-right px-5 py-4 font-display font-bold">Livraison</th>
              <th className="text-right px-5 py-4 font-display font-bold">Stock</th>
              <th className="text-right px-5 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((o, i) => (
              <tr
                key={o.offer_id}
                className="transition hover:bg-cream-warm"
                style={i % 2 === 0 ? { background: 'white' } : { background: 'var(--cream-surface)' }}
              >
                <td className="px-5 py-4 font-bold" style={{ color: 'var(--brand-dark)' }}>
                  {o.merchant_name}
                </td>
                <td className="px-5 py-4 max-w-xs truncate text-fg" title={o.title}>{o.title}</td>
                <td
                  className="px-5 py-4 text-right font-display font-bold text-lg"
                  style={{ color: 'var(--terracotta-deep)' }}
                >
                  {formatPrice(o.price ?? undefined, o.currency)}
                </td>
                <td className="px-5 py-4 text-right text-fg-muted">
                  {o.shipping_cost != null ? formatPrice(o.shipping_cost, o.currency) : '—'}
                </td>
                <td className="px-5 py-4 text-right">
                  <span
                    className="pill"
                    style={
                      o.in_stock
                        ? { background: 'color-mix(in oklab, var(--brand) 16%, white)', color: 'var(--brand-dark)' }
                        : { background: 'color-mix(in oklab, var(--terracotta-deep) 14%, white)', color: 'var(--terracotta-deep)' }
                    }
                  >
                    {o.in_stock ? 'En stock' : 'Rupture'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <a
                    href={`/api/click?offer=${o.offer_id}`}
                    className="btn-primary !py-2 !px-4 !text-sm"
                    rel="sponsored nofollow noopener"
                    target="_blank"
                  >
                    Voir ↗
                  </a>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-fg-muted">
                  Aucune offre trouvée pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
