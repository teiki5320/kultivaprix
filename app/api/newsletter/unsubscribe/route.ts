import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/newsletter/unsubscribe?token=<unsubscribe_token>
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.redirect(new URL('/desinscription?error=missing-token', req.url));
  try {
    const sb = supabaseAdmin();
    await sb
      .from('newsletter_subscribers')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('unsubscribe_token', token);
    return NextResponse.redirect(new URL('/desinscription?type=newsletter&ok=1', req.url));
  } catch (e) {
    return NextResponse.redirect(new URL('/desinscription?error=server', req.url));
  }
}
