import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * /api/click?offer=<uuid>
 *  - Log l'événement dans `clicks`
 *  - Redirige en 302 vers l'URL affiliée du marchand
 *
 * Utilisateur : anonymisé via sha256(ip + ua).
 * Aucune donnée personnelle n'est persistée.
 */
export async function GET(req: NextRequest) {
  const offerId = req.nextUrl.searchParams.get('offer');
  if (!offerId) return NextResponse.json({ error: 'missing offer param' }, { status: 400 });

  let target: string | null = null;
  try {
    const sb = supabaseAdmin();
    const { data: offer } = await sb
      .from('offers')
      .select('id, url, product_id, merchant_id')
      .eq('id', offerId)
      .single();

    if (!offer) return NextResponse.json({ error: 'offer not found' }, { status: 404 });
    target = offer.url;

    const ua = req.headers.get('user-agent') ?? '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
    const userHash = crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex');

    // Fire-and-forget log
    await sb.from('clicks').insert({
      offer_id: offer.id,
      product_id: offer.product_id,
      merchant_id: offer.merchant_id,
      user_hash: userHash,
      referer: req.headers.get('referer') ?? null,
      utm: Object.fromEntries(req.nextUrl.searchParams.entries()),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[click] log failed', (e as Error).message);
    // don't block redirect on logging failure
  }

  if (!target) return NextResponse.json({ error: 'no target url' }, { status: 500 });
  return NextResponse.redirect(target, 302);
}
