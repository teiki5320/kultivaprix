import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const revalidate = 600; // 10 min cache for prices

/**
 * GET /api/v1/offers?productSlug=<slug>
 * Returns the live offers for a product. Includes merchant slug + name.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('productSlug');
  if (!slug) return NextResponse.json({ error: 'missing_productSlug' }, { status: 400 });

  const { data: product } = await supabase
    .from('products_master')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (!product) return NextResponse.json({ error: 'product_not_found' }, { status: 404 });

  const { data: offers } = await supabase
    .from('offers')
    .select('id, title, price, currency, in_stock, shipping_cost, last_seen_at, merchants(slug, name)')
    .eq('product_id', (product as any).id);

  const out = (offers ?? []).map((o: any) => ({
    id: o.id,
    title: o.title,
    price: o.price,
    currency: o.currency,
    in_stock: o.in_stock,
    shipping_cost: o.shipping_cost,
    last_seen_at: o.last_seen_at,
    merchant_slug: o.merchants?.slug,
    merchant_name: o.merchants?.name,
  }));

  return NextResponse.json({ productSlug: slug, offers: out });
}
