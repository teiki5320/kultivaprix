import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  email: z.string().email(),
  region: z.string().optional(),
  level: z.string().optional(),
});

/**
 * POST /api/newsletter
 * Body: { email, region?, level? }
 * Persists a subscriber. Confirmation/welcome email is sent by an
 * external worker — see TODO at the bottom of this file.
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
    const { data, error } = await sb
      .from('newsletter_subscribers')
      .upsert(
        {
          email: parsed.email.toLowerCase(),
          region: parsed.region ?? null,
          level: parsed.level ?? null,
        },
        { onConflict: 'email' },
      )
      .select('unsubscribe_token')
      .single();
    if (error) return NextResponse.json({ error: 'insert_failed', details: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, unsubscribeToken: (data as any).unsubscribe_token });
  } catch (e) {
    return NextResponse.json({ error: 'server_error', details: (e as Error).message }, { status: 500 });
  }
}

// TODO(emails): the welcome email + scheduled seasonal newsletter
// (4-8×/year) should be sent by a worker reading this table. Add a
// confirmed_at column update once the user double-opt-in confirms.
