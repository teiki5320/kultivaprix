import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-kawaii-green-50 border-t border-kawaii-green-100 mt-10">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-sm">
        <div>
          <p className="font-display text-lg text-kawaii-green-600 font-extrabold">Kultivaprix 🌱</p>
          <p className="text-kawaii-ink/70">
            Comparateur neutre. Les liens marchands sont des liens d&apos;affiliation — ils
            financent le site sans changer le prix pour toi.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4">
          <Link href="/guide/bien-choisir-ses-graines">Guides</Link>
          <a href="https://kultiva.app" target="_blank" rel="noopener noreferrer">
            App Kultiva
          </a>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/confidentialite">Confidentialité</Link>
        </nav>
      </div>
    </footer>
  );
}
