import Link from 'next/link';
import Image from 'next/image';
import { NewsletterForm } from './NewsletterForm';
import { MONTHS } from '@/lib/calendar';

export function Footer() {
  const currentMonth = MONTHS[new Date().getMonth()].slug;
  return (
    <footer className="mt-16 text-white" style={{ background: 'var(--ink-deep)' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-14 pb-8">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr] pb-10 border-b border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/logokprix.PNG"
                alt="Kultivaprix"
                width={40}
                height={40}
                className="w-10 h-10 rounded-2xl object-contain"
              />
              <span className="font-display text-2xl font-bold">Kultivaprix</span>
            </div>
            <p className="font-body text-sm leading-relaxed text-white/60 max-w-xs">
              L&apos;étal Kultiva sur le web : le catalogue potager de l&apos;app, à butiner depuis ton ordi. Fiches espèces, calendrier de semis, bilan du jardin.
            </p>
          </div>

          <div>
            <h5 className="font-display font-bold text-sm mb-3">Explorer</h5>
            <ul className="space-y-2 font-body text-sm text-white/70">
              <li><Link href="/" className="hover:text-white">L&apos;étal</Link></li>
              <li><Link href="/catalogue" className="hover:text-white">Catalogue</Link></li>
              <li><Link href={`/que-semer/${currentMonth}`} className="hover:text-white">Que semer</Link></li>
              <li><Link href={`/que-recolter/${currentMonth}`} className="hover:text-white">Que récolter</Link></li>
              <li><Link href="/bilan" className="hover:text-white">Bilan du jardin</Link></li>
              <li><Link href="/conseil" className="hover:text-white">Demander conseil</Link></li>
              <li><Link href="/afrique-de-louest" className="hover:text-white">Afrique de l’Ouest</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-display font-bold text-sm mb-3">Kultiva</h5>
            <ul className="space-y-2 font-body text-sm text-white/70">
              <li><Link href="/app" className="hover:text-white">L&apos;app Kultiva</Link></li>
              <li><Link href="/glossaire" className="hover:text-white">Glossaire</Link></li>
              <li><Link href="/kits" className="hover:text-white">Kits potager</Link></li>
              <li><Link href="/quiz" className="hover:text-white">Quiz quoi planter</Link></li>
              <li><Link href="/calendrier-imprimable" className="hover:text-white">Calendrier imprimable</Link></li>
              <li><Link href="/actualites" className="hover:text-white">Actualités</Link></li>
              {process.env.NEXT_PUBLIC_TIPJAR_URL && (
                <li>
                  <a
                    href={process.env.NEXT_PUBLIC_TIPJAR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-white"
                    style={{ color: 'var(--butter-yellow)' }}
                  >
                    ☕ Soutenir le projet
                  </a>
                </li>
              )}
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

        <div className="mt-10 grid md:grid-cols-[1.4fr_1fr] gap-6 items-center pb-6">
          <div>
            <h5 className="font-display font-bold text-base mb-1">🌱 Newsletter saisonnière</h5>
            <p className="font-body text-sm text-white/60 leading-relaxed max-w-md">
              4 à 8 emails par an : que semer, que récolter, quelles bonnes affaires. Pas de spam.
            </p>
          </div>
          <div className="relative">
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-5 flex flex-col md:flex-row justify-between gap-2 font-body text-xs text-white/50">
          <div>© {new Date().getFullYear()} Kultivaprix · Cultivé avec amour</div>
          <div>Pour les jardinières et jardiniers francophones</div>
        </div>
      </div>
    </footer>
  );
}
