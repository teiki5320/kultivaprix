import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  productSlug: z.string().min(1),
  displayName: z.string().min(1).max(60),
  region: z.string().max(60).optional(),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(20).max(1500),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: 'invalid_payload', details: (e as Error).message }, { status: 400 });
  }

  try {
    const sb = supabaseAdmin();
    const { data: product, error: pErr } = await sb
      .from('products_master')
      .select('id')
      .eq('slug', parsed.productSlug)
      .single();
    if (pErr || !product) return NextResponse.json({ error: 'product_not_found' }, { status: 404 });

    const { error } = await sb.from('reviews').insert({
      product_id: (product as any).id,
      display_name: parsed.displayName,
      region: parsed.region ?? null,
      rating: parsed.rating,
      body: parsed.body,
      // status defaults to 'pending'
    });
    if (error) return NextResponse.json({ error: 'insert_failed', details: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'server_error', details: (e as Error).message }, { status: 500 });
  }
}
