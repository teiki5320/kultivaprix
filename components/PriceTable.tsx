import { formatRelativeFR } from '@/lib/format-relative';
import { parseQuantity, unitPrice } from '@/lib/parse-quantity';
import { detectTags } from '@/lib/parse-tags';
import { convertAndFormat } from '@/lib/format-money';
import type { Currency } from '@/lib/preferences';

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

const TAG_STYLES = {
  bio: { background: 'color-mix(in oklab, var(--brand) 18%, white)', color: 'var(--brand-dark)' },
  f1: { background: 'var(--sky-pastel)', color: '#2D6B8F' },
  reproductible: { background: 'color-mix(in oklab, var(--brand) 12%, white)', color: 'var(--brand-dark)' },
  origineFR: { background: 'color-mix(in oklab, var(--terracotta-deep) 14%, white)', color: 'var(--terracotta-deep)' },
  ancienne: { background: 'var(--butter-yellow)', color: '#7A5A1E' },
};

const TAG_LABELS: Record<keyof typeof TAG_STYLES, string> = {
  bio: 'Bio',
  f1: 'F1',
  reproductible: 'Reproductible',
  origineFR: 'FR',
  ancienne: 'Ancienne',
};

export function PriceTable({ offers, currency = 'EUR' }: { offers: OfferRow[]; currency?: Currency }) {
  const sorted = [...offers].sort((a, b) => (a.price ?? 9e9) - (b.price ?? 9e9));
  const cheapestId = sorted.find((o) => o.in_stock && o.price != null)?.offer_id;

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
            {sorted.map((o, i) => {
              const qty = parseQuantity(o.title);
              const unit = unitPrice(o.price, qty);
              const tags = detectTags(o.title);
              const isBest = o.offer_id === cheapestId;
              return (
                <tr
                  key={o.offer_id}
                  className="transition hover:bg-cream-warm relative"
                  style={
                    isBest
                      ? { background: 'color-mix(in oklab, var(--brand) 10%, white)' }
                      : i % 2 === 0
                        ? { background: 'white' }
                        : { background: 'var(--cream-surface)' }
                  }
                >
                  <td className="px-5 py-4 font-bold align-top" style={{ color: 'var(--brand-dark)' }}>
                    {o.merchant_name}
                    {isBest && (
                      <div
                        className="text-[10px] font-extrabold mt-1 inline-flex items-center gap-1"
                        style={{ color: 'var(--brand-dark)' }}
                        aria-label="Offre la moins chère"
                      >
                        ⭐ Meilleur prix
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 max-w-xs align-top text-fg" title={o.title}>
                    <div className="truncate">{o.title}</div>
                    {(tags.bio || tags.f1 || tags.reproductible || tags.origineFR || tags.ancienne) && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(Object.keys(TAG_STYLES) as (keyof typeof TAG_STYLES)[])
                          .filter((k) => tags[k])
                          .map((k) => (
                            <span key={k} className="pill" style={TAG_STYLES[k]}>
                              {TAG_LABELS[k]}
                            </span>
                          ))}
                      </div>
                    )}
                    <div className="text-[10px] text-fg-subtle mt-1.5 font-semibold">
                      Mis à jour {formatRelativeFR(o.last_seen_at)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right align-top">
                    <div
                      className="font-display font-bold text-lg"
                      style={{ color: 'var(--terracotta-deep)' }}
                    >
                      {convertAndFormat(o.price, currency)}
                    </div>
                    {unit && currency === 'EUR' && (
                      <div className="text-[11px] font-semibold text-fg-subtle mt-0.5">
                        {unit.value.toFixed(unit.value < 1 ? 3 : 2).replace('.', ',')} {unit.label}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right text-fg-muted align-top">
                    {o.shipping_cost != null ? convertAndFormat(o.shipping_cost, currency) : '—'}
                  </td>
                  <td className="px-5 py-4 text-right align-top">
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
                  <td className="px-5 py-4 text-right align-top">
                    <a
                      href={`/api/click?offer=${o.offer_id}`}
                      className="btn-primary !py-2 !px-4 !text-sm"
                      rel="sponsored nofollow noopener"
                      target="_blank"
                      aria-label={`Voir l'offre chez ${o.merchant_name}`}
                    >
                      Voir ↗
                    </a>
                  </td>
                </tr>
              );
            })}
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
