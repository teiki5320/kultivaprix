import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const revalidate = 1800; // 30 min cache

/**
 * GET /api/v1/products
 * Public read API. No auth (rate-limited at the platform layer).
 *
 * Query:
 *   slug   — single product (returns one)
 *   q      — text search (returns up to 50)
 *   cat    — category slug (returns up to 100)
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const q = req.nextUrl.searchParams.get('q');
  const cat = req.nextUrl.searchParams.get('cat');

  if (slug) {
    const { data } = await supabase
      .from('products_master')
      .select('id, slug, name, brand, gtin, image_url, description, attributes, categories(slug, name)')
      .eq('slug', slug)
      .maybeSingle();
    if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ product: data });
  }

  let query = supabase
    .from('products_master')
    .select('slug, name, brand, image_url, categories(slug, name)')
    .not('slug', 'like', 'tmp-%')
    .limit(100);

  if (q) query = query.ilike('name', `%${q}%`);
  if (cat) {
    const { data: c } = await supabase.from('categories').select('id').eq('slug', cat).maybeSingle();
    if (c) query = query.eq('category_id', (c as any).id);
  }

  const { data } = await query;
  return NextResponse.json({ products: data ?? [] });
}
