import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  email: z.string().email(),
  productSlug: z.string().min(1),
  kind: z.enum(['price', 'stock', 'season']),
  thresholdEur: z.number().positive().optional(),
  region: z.string().optional(),
});

/**
 * POST /api/alerts
 * Body: { email, productSlug, kind, thresholdEur?, region? }
 *
 * Creates a price/stock/season alert. Email dispatch happens via a
 * separate worker (see TODO at bottom of this file).
 */
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

    const { data, error } = await sb
      .from('price_alerts')
      .upsert(
        {
          email: parsed.email.toLowerCase(),
          product_id: (product as any).id,
          kind: parsed.kind,
          threshold_eur: parsed.thresholdEur ?? null,
          region: parsed.region ?? null,
        },
        { onConflict: 'email,product_id,kind' },
      )
      .select('unsubscribe_token')
      .single();

    if (error) return NextResponse.json({ error: 'insert_failed', details: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, unsubscribeToken: (data as any).unsubscribe_token });
  } catch (e) {
    return NextResponse.json({ error: 'server_error', details: (e as Error).message }, { status: 500 });
  }
}

// TODO(emails): wire a Resend/Postmark sender from a scheduled worker
// (Vercel Cron or Supabase Edge Function) that scans `price_alerts`
// joined with `offers`/`price_history` and dispatches when a threshold
// is crossed. Until then this endpoint is a no-op email-wise; alerts
// are persisted and visible to the worker.
