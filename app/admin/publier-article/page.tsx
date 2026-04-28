import type { Metadata } from 'next';
import { PublierForm } from './PublierForm';

export const metadata: Metadata = {
  title: 'Publier un article · Admin Kultiva',
  robots: { index: false, follow: false },
};

export default function PublierArticlePage() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full">
      <header>
        <span className="kicker">🛠 Admin</span>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-fg mt-2 tracking-tight">
          Publier un article
        </h1>
        <p className="font-body text-fg-muted mt-2 leading-relaxed">
          Cet article apparaîtra sur <code>/actualites</code> et à son URL canonique{' '}
          <code>/actualite/&lt;slug&gt;</code>. Pour les news courtes app + Instagram, utiliser
          un autre flow (V2).
        </p>
      </header>
      <PublierForm />
    </div>
  );
}
