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
    <div className="card-kawaii overflow-x-auto p-0">
      <table className="w-full text-sm">
        <thead className="bg-kawaii-pink-50 text-kawaii-ink/80">
          <tr>
            <th className="text-left px-4 py-3">Marchand</th>
            <th className="text-left px-4 py-3">Produit</th>
            <th className="text-right px-4 py-3">Prix</th>
            <th className="text-right px-4 py-3">Livraison</th>
            <th className="text-right px-4 py-3">Stock</th>
            <th className="text-right px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((o, i) => (
            <tr key={o.offer_id} className={i % 2 === 0 ? 'bg-white' : 'bg-kawaii-pink-50/30'}>
              <td className="px-4 py-3 font-semibold text-kawaii-green-600">{o.merchant_name}</td>
              <td className="px-4 py-3 max-w-xs truncate" title={o.title}>{o.title}</td>
              <td className="px-4 py-3 text-right font-semibold">
                {formatPrice(o.price ?? undefined, o.currency)}
              </td>
              <td className="px-4 py-3 text-right text-kawaii-ink/60">
                {o.shipping_cost != null ? formatPrice(o.shipping_cost, o.currency) : '—'}
              </td>
              <td className="px-4 py-3 text-right">
                <span
                  className={`pill ${
                    o.in_stock
                      ? 'bg-kawaii-green-100 text-kawaii-green-600'
                      : 'bg-kawaii-pink-100 text-kawaii-pink-600'
                  }`}
                >
                  {o.in_stock ? 'En stock' : 'Rupture'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <a
                  href={`/api/click?offer=${o.offer_id}`}
                  className="btn-kawaii !py-1.5 !px-4"
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
              <td colSpan={6} className="px-4 py-8 text-center text-kawaii-ink/60">
                Aucune offre trouvée pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
