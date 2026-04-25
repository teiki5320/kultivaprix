import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/cart?slugs=a,b,c
 * Returns each product with its live offers, so the client can compute the
 * optimal multi-merchant split without giving up visibility into shipping costs.
 */
export async function GET(req: NextRequest) {
  const slugsParam = req.nextUrl.searchParams.get('slugs') ?? '';
  const slugs = slugsParam.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 30);
  if (slugs.length === 0) return NextResponse.json({ products: [] });

  const { data: products } = await supabase
    .from('products_master')
    .select(
      'id, slug, name, image_url, offers(price, in_stock, shipping_cost, merchant_id, merchants(slug, name))',
    )
    .in('slug', slugs);

  const out = (products ?? []).map((p: any) => ({
    slug: p.slug,
    name: p.name,
    image_url: p.image_url,
    offers: (p.offers ?? [])
      .filter((o: any) => typeof o.price === 'number')
      .map((o: any) => ({
        merchant_id: o.merchant_id,
        merchant_slug: o.merchants?.slug ?? 'inconnu',
        merchant_name: o.merchants?.name ?? 'Marchand',
        price: Number(o.price),
        shipping_cost: o.shipping_cost != null ? Number(o.shipping_cost) : null,
        in_stock: !!o.in_stock,
      })),
  }));

  // Preserve the order requested by the client
  out.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
  return NextResponse.json({ products: out });
}
