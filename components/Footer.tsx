import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 text-white" style={{ background: 'var(--ink-deep)' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-14 pb-8">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr] pb-10 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                aria-hidden
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: 'linear-gradient(135deg, #FFE7A0, #A8D5A2)' }}
              >
                🌷
              </span>
              <span className="font-display text-2xl font-bold">Kultivaprix</span>
            </div>
            <p className="font-body text-sm leading-relaxed text-white/60 max-w-xs">
              Comparateur neutre de graines, plants et outils. Les liens marchands sont des liens
              d&apos;affiliation — ils financent le site sans changer le prix pour toi.
            </p>
          </div>

          <div>
            <h5 className="font-display font-bold text-sm mb-3">Explorer</h5>
            <ul className="space-y-2 font-body text-sm text-white/70">
              <li><Link href="/graines" className="hover:text-white">Graines</Link></li>
              <li><Link href="/plants" className="hover:text-white">Plants</Link></li>
              <li><Link href="/outils" className="hover:text-white">Outils</Link></li>
              <li><Link href="/recherche" className="hover:text-white">Rechercher</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-display font-bold text-sm mb-3">Kultiva</h5>
            <ul className="space-y-2 font-body text-sm text-white/70">
              <li>
                <a href="https://kultiva.app" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  L&apos;app Kultiva
                </a>
              </li>
              <li><Link href="/guide/bien-choisir-ses-graines" className="hover:text-white">Guides</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-display font-bold text-sm mb-3">Juridique</h5>
            <ul className="space-y-2 font-body text-sm text-white/70">
              <li><Link href="/confidentialite" className="hover:text-white">Confidentialité</Link></li>
              <li><Link href="/mentions-legales" className="hover:text-white">Mentions légales</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex flex-col md:flex-row justify-between gap-2 font-body text-xs text-white/50">
          <div>© {new Date().getFullYear()} Kultivaprix · Cultivé avec amour</div>
          <div>🌱 Made for jardiniers francophones</div>
        </div>
      </div>
    </footer>
  );
}
