import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { REFERRAL_COOKIE } from '@/lib/kultiva-link';

export const metadata = { robots: { index: false, follow: false } };

/**
 * /amb/<code> — sets a referral cookie then redirects to /ambassadeur with the
 * code applied so the visitor can see they're "with" that ambassador.
 *
 * The cookie is then injected into every Kultiva link via AddToKultivaPlanButton.
 */
export default function ReferralLandingPage({ params }: { params: { code: string } }) {
  const code = params.code.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
  if (!code) redirect('/');
  cookies().set(REFERRAL_COOKIE, code, {
    httpOnly: false, // we read it from the client to inject into Kultiva URLs
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 90, // 90 days
    path: '/',
  });
  redirect(`/ambassadeur?ref=${encodeURIComponent(code)}`);
}
