import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, getAdminSecret } from '@/lib/admin';

export const metadata = { title: 'Admin · login', robots: { index: false, follow: false } };

async function login(formData: FormData) {
  'use server';
  const secret = formData.get('secret');
  const expected = getAdminSecret();
  if (typeof secret !== 'string' || !expected || secret !== expected) {
    redirect('/admin/login?error=1');
  }
  cookies().set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8h
    path: '/',
  });
  redirect('/admin');
}

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="max-w-sm mx-auto py-16 flex flex-col gap-4">
      <h1 className="font-display text-3xl font-bold text-fg text-center">🔐 Admin</h1>
      {searchParams.error && (
        <p className="font-body text-sm text-red-700 text-center">Mot de passe incorrect.</p>
      )}
      {!getAdminSecret() && (
        <div className="card-cream text-sm text-fg-muted">
          La variable <code>KULTIVAPRIX_ADMIN_SECRET</code> n&apos;est pas configurée — ajoute-la
          dans Vercel pour activer l&apos;accès.
        </div>
      )}
      <form action={login} className="card-cream space-y-3">
        <input
          type="password"
          name="secret"
          required
          autoComplete="current-password"
          placeholder="Secret admin"
          className="w-full px-4 py-3 rounded-xl bg-white font-body focus:outline-none border border-cream"
        />
        <button type="submit" className="btn-primary w-full justify-center">Se connecter</button>
      </form>
    </div>
  );
}
