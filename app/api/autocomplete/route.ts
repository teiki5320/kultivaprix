import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/search';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * /api/autocomplete?q=<text>
 * Returns up to 8 products matching the query, sorted by trigram similarity.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ results: [] });
  try {
    const hits = await searchProducts(q, 8);
    return NextResponse.json({
      results: hits.map((h) => ({
        slug: h.slug,
        name: h.name,
        image_url: h.image_url,
        min_price: h.min_price,
        offer_count: h.offer_count,
      })),
    });
  } catch (e) {
    return NextResponse.json({ results: [] });
  }
}
