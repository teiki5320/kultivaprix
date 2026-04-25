import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminRequest } from '@/lib/admin';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({ decision: z.enum(['approve', 'reject']) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }
  const sb = supabaseAdmin();
  const status = parsed.decision === 'approve' ? 'approved' : 'rejected';
  const { error } = await sb
    .from('reviews')
    .update({
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
    })
    .eq('id', params.id);
  if (error) return NextResponse.json({ error: 'update_failed', details: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status });
}
