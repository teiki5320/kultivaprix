/**
 * Multi-merchant cart helpers — pure client-side (localStorage), no
 * accounts. The cart is a list of product slugs; the panier page resolves
 * them to live offers and computes the optimal basket per merchant
 * (taking shipping_cost into account when the merchant publishes it).
 */

export const CART_KEY = 'kp_cart';

export function readCart(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export function writeCart(slugs: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(Array.from(new Set(slugs))));
    window.dispatchEvent(new CustomEvent('kp_cart_change'));
  } catch {
    // ignore quota / privacy mode errors
  }
}

export function addToCart(slug: string) {
  const cart = readCart();
  if (cart.includes(slug)) return cart;
  const next = [...cart, slug];
  writeCart(next);
  return next;
}

export function removeFromCart(slug: string) {
  const next = readCart().filter((s) => s !== slug);
  writeCart(next);
  return next;
}

/**
 * Given a product → offers map, find the merchant assignment that
 * minimises total cost. Naive but works for the small (≤ 20) baskets we
 * expect: we group by merchant first, then check if a single-merchant
 * solution is cheaper than the per-product min — that's the realistic
 * "win" because shipping is paid once.
 */
export interface OfferLite {
  merchant_id: string;
  merchant_slug: string;
  merchant_name: string;
  price: number;
  shipping_cost: number | null;
  in_stock: boolean;
}

export interface ProductOffers {
  slug: string;
  name: string;
  image_url: string | null;
  offers: OfferLite[];
}

export interface BasketLine {
  product: ProductOffers;
  pickedMerchantId: string | null;
  unitPrice: number | null;
}

export interface BasketSolution {
  lines: BasketLine[];
  /** merchantId → { name, items: BasketLine[], subtotal, shipping } */
  merchantBreakdown: Map<string, {
    name: string;
    slug: string;
    items: BasketLine[];
    subtotal: number;
    shipping: number;
  }>;
  total: number;
}

function inStock(o: OfferLite) { return o.in_stock && o.price != null; }

export function computeBasket(products: ProductOffers[]): BasketSolution {
  // Step 1 — pick the cheapest in-stock offer per product (ignore shipping).
  const perProductCheapest: BasketLine[] = products.map((p) => {
    const stocked = p.offers.filter(inStock);
    if (!stocked.length) return { product: p, pickedMerchantId: null, unitPrice: null };
    const cheapest = stocked.reduce((a, b) => (a.price < b.price ? a : b));
    return { product: p, pickedMerchantId: cheapest.merchant_id, unitPrice: cheapest.price };
  });

  // Step 2 — list candidate merchants that can fulfil ALL items in stock.
  const allMerchants = new Map<string, { name: string; slug: string }>();
  products.forEach((p) =>
    p.offers.filter(inStock).forEach((o) =>
      allMerchants.set(o.merchant_id, { name: o.merchant_name, slug: o.merchant_slug }),
    ),
  );

  let bestLines = perProductCheapest;
  let bestTotal = totalCost(perProductCheapest, products);

  for (const [merchantId] of allMerchants) {
    const candidate: BasketLine[] = products.map((p) => {
      const o = p.offers.find((oo) => oo.merchant_id === merchantId && inStock(oo));
      if (o) return { product: p, pickedMerchantId: merchantId, unitPrice: o.price };
      const stocked = p.offers.filter(inStock);
      if (!stocked.length) return { product: p, pickedMerchantId: null, unitPrice: null };
      const cheapest = stocked.reduce((a, b) => (a.price < b.price ? a : b));
      return { product: p, pickedMerchantId: cheapest.merchant_id, unitPrice: cheapest.price };
    });
    const t = totalCost(candidate, products);
    if (t < bestTotal) {
      bestTotal = t;
      bestLines = candidate;
    }
  }

  // Build breakdown by merchant
  const breakdown = new Map<string, {
    name: string; slug: string; items: BasketLine[]; subtotal: number; shipping: number;
  }>();
  for (const line of bestLines) {
    if (!line.pickedMerchantId || line.unitPrice == null) continue;
    const offer = line.product.offers.find(
      (o) => o.merchant_id === line.pickedMerchantId,
    )!;
    const entry = breakdown.get(line.pickedMerchantId) ?? {
      name: offer.merchant_name,
      slug: offer.merchant_slug,
      items: [],
      subtotal: 0,
      shipping: offer.shipping_cost ?? 0,
    };
    entry.items.push(line);
    entry.subtotal += line.unitPrice;
    breakdown.set(line.pickedMerchantId, entry);
  }

  let total = 0;
  for (const v of breakdown.values()) total += v.subtotal + v.shipping;

  return { lines: bestLines, merchantBreakdown: breakdown, total };
}

function totalCost(lines: BasketLine[], _products: ProductOffers[]): number {
  // Sum subtotals + one shipping per merchant
  let sum = 0;
  const shippingByMerchant = new Map<string, number>();
  for (const line of lines) {
    if (line.unitPrice == null || !line.pickedMerchantId) continue;
    sum += line.unitPrice;
    if (!shippingByMerchant.has(line.pickedMerchantId)) {
      const offer = line.product.offers.find((o) => o.merchant_id === line.pickedMerchantId);
      shippingByMerchant.set(line.pickedMerchantId, offer?.shipping_cost ?? 0);
    }
  }
  for (const v of shippingByMerchant.values()) sum += v;
  return sum;
}
