import type { Metadata } from 'next';
import Image from 'next/image';
import { KULTIVA_APP_URL } from '@/lib/utils';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "L'app Kultiva · ton copain potager au creux de la main",
  description:
    "Calendrier de semis selon ta région, Poussidex évolutif, tutos vidéo, météo jardin : l'app Kultiva t'accompagne au quotidien sur iOS et Android.",
  alternates: { canonical: '/app' },
};

const APP_URL = (() => {
  const u = new URL(KULTIVA_APP_URL);
  u.searchParams.set('utm_source', 'kultivaprix');
  u.searchParams.set('utm_medium', 'app-page');
  u.searchParams.set('utm_campaign', 'main-cta');
  return u.toString();
})();

interface Feature {
  image: string;
  alt: string;
  kicker: string;
  title: string;
  body: string;
  accent: string; // hex
}

const FEATURES: Feature[] = [
  {
    image: '/app-welcome.png',
    alt: "Écran d'accueil de l'app Kultiva",
    kicker: '🌱 Ton copain potager',
    title: 'Tout au même endroit',
    body:
      "Calendrier de semis, suivi d'arrosage, météo locale et conseils — l'app rassemble ce qui était éparpillé dans dix onglets de navigateur.",
    accent: '#A8D5A2',
  },
  {
    image: '/app-dashboard.png',
    alt: "Tableau de bord de l'app Kultiva",
    kicker: '📅 Ton tableau de bord',
    title: 'Une routine quotidienne',
    body:
      "Chaque jour, ton légume du jour, la météo et les cartes Semer / Récolter / Calendrier qui se mettent à jour selon la saison et ta région.",
    accent: '#FFE7A0',
  },
  {
    image: '/app-poussidex.png',
    alt: "Le Poussidex — Tamassi évolutif de Kultiva",
    kicker: '🌸 Ton Poussidex',
    title: 'Un Tamassi qui grandit avec toi',
    body:
      "Adopte Poussia, Soleia ou Spira et fais-le évoluer sur 11 stades. Défis photo, badges et niveau 100 façon Pokémon — pour rendre le potager addictif.",
    accent: '#FBD8E6',
  },
  {
    image: '/app-tutos.png',
    alt: "Les tutos vidéo de l'app Kultiva",
    kicker: '🎬 Apprends en vidéo',
    title: 'Tutos qui vont droit au but',
    body:
      "Réussir tes semis, arroser juste, lutter contre les nuisibles, aménager ta parcelle : des courtes vidéos pour passer à l'action sans lire 10 forums.",
    accent: '#E8A87C',
  },
];

export default function AppPage() {
  return (
    <div className="flex flex-col gap-12">
      {/* Visite guidée animée — en premier */}
      <section className="flex flex-col gap-6">
        <header className="text-center">
          <span className="kicker">🎬 Visite guidée animée</span>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-fg mt-3 tracking-tight">
            L&apos;app Kultiva en <em className="hero-em">une minute</em>
          </h1>
          <p className="font-body text-fg-muted mt-3 max-w-xl mx-auto">
            Tableau de bord, météo, étal, Poussidex — un tour animé qui passe en revue chaque
            écran. Lance-le et regarde.
          </p>
        </header>
        <div
          className="mx-auto w-full"
          style={{ maxWidth: '460px', aspectRatio: '1080 / 1920' }}
        >
          <iframe
            src="/dashboard-tour/index.html"
            title="Visite guidée du tableau de bord Kultiva"
            loading="lazy"
            className="w-full h-full rounded-[40px] border-0"
            style={{ boxShadow: '0 30px 60px -20px rgba(60,80,60,.30)' }}
          />
        </div>
      </section>

      {/* Hero */}
      <section
        className="rounded-bubble relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #FFE7A0 0%, #FBD8E6 50%, #A8D5A2 100%)',
        }}
      >
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-center p-8 md:p-12">
          <div>
            <span className="kicker">📱 L&apos;app Kultiva</span>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-fg mt-3 tracking-tight leading-tight">
              Ton <em className="hero-em">copain potager</em>
              <br className="hidden md:block" /> au creux de la main
            </h2>
            <p className="font-body text-fg/80 mt-4 leading-relaxed max-w-lg">
              Kultivaprix sur ordinateur, c&apos;est chouette. Mais le potager, ça se vit dehors —
              avec ton téléphone dans la poche. Voilà ce que l&apos;app fait en plus.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href={APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Ouvrir Kultiva <span className="text-lg">→</span>
              </a>
              <a
                href="#features"
                className="font-body font-bold px-5 py-3 rounded-full bg-white/70 hover:bg-white transition text-fg"
              >
                Voir les fonctionnalités
              </a>
            </div>
            <p className="font-body text-xs text-fg-muted mt-4">
              iOS &amp; Android · gratuit pour commencer · français
            </p>
          </div>
          <div className="flex md:justify-end">
            <div
              className="relative w-44 h-44 md:w-56 md:h-56 rounded-[44px] overflow-hidden shadow-xl"
              style={{ background: '#fff', border: '4px solid rgba(255,255,255,0.6)' }}
            >
              <Image
                src="/app-icon.png"
                alt="Icône de l'app Kultiva"
                fill
                sizes="(max-width: 768px) 176px, 224px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Liaison web ↔ app */}
      <section className="card-cream">
        <div className="flex items-start gap-4">
          <div
            aria-hidden
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: 'linear-gradient(135deg, #FFE7A0, #A8D5A2)' }}
          >
            🤝
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-fg">
              Le web et l&apos;app, deux versants d&apos;un même potager
            </h2>
            <p className="font-body text-fg-muted mt-2 leading-relaxed">
              Kultivaprix te donne <strong className="text-fg">l&apos;étal</strong> (catalogue
              complet à butiner depuis ton ordi), <strong className="text-fg">le calendrier de
              semis</strong> et le <strong className="text-fg">bilan</strong> du prix de revient
              de tes récoltes. L&apos;app Kultiva, elle, gère <strong className="text-fg">ton
              potager personnel</strong> — l&apos;hydroponie, le Poussidex, les rappels d&apos;arrosage.
              Les deux parlent la même langue.
            </p>
          </div>
        </div>
      </section>

      {/* Features avec screenshots */}
      <section id="features" className="flex flex-col gap-8">
        <header className="text-center">
          <span className="kicker">✨ Ce que tu trouves dans l&apos;app</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-fg mt-3 tracking-tight">
            Quatre raisons d&apos;installer Kultiva
          </h2>
        </header>
        <ul className="flex flex-col gap-6">
          {FEATURES.map((f, i) => (
            <li
              key={f.title}
              className="rounded-bubble bg-white p-6 md:p-8 grid md:grid-cols-[260px_1fr] gap-6 md:gap-10 items-center"
              style={{ border: `2px solid ${f.accent}66` }}
            >
              <div
                className={`relative aspect-square rounded-[40px] overflow-hidden mx-auto md:mx-0 w-44 md:w-full ${
                  i % 2 === 1 ? 'md:order-2' : ''
                }`}
                style={{
                  background: `linear-gradient(135deg, ${f.accent}33, ${f.accent}66)`,
                }}
              >
                <Image
                  src={f.image}
                  alt={f.alt}
                  fill
                  sizes="(max-width: 768px) 176px, 260px"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="kicker">{f.kicker}</span>
                <h3 className="font-display font-bold text-2xl md:text-3xl text-fg mt-2 leading-tight">
                  {f.title}
                </h3>
                <p className="font-body text-fg-muted mt-3 leading-relaxed">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Bonus : graines de qualité */}
      <section className="card-cream">
        <h2 className="font-display font-bold text-xl text-fg">
          <span aria-hidden className="mr-2">🌾</span>
          Et pour les graines, on aime…
        </h2>
        <p className="font-body text-fg-muted mt-3 leading-relaxed">
          Kultiva ne vend rien. Mais si tu cherches des semences paysannes, libres et reproductibles,
          on a un faible pour{' '}
          <a
            href="https://kokopelli-semences.fr/fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-brand-dark hover:underline"
          >
            Kokopelli
          </a>{' '}
          — association qui défend la biodiversité cultivée depuis plus de 25 ans. Variétés
          anciennes, sans hybrides F1, sans brevets.
        </p>
      </section>

      {/* CTA final */}
      <section
        className="rounded-bubble p-8 md:p-10 text-center"
        style={{ background: 'linear-gradient(135deg, #A8D5A2 0%, #FFE7A0 100%)' }}
      >
        <h2 className="font-display font-bold text-3xl md:text-4xl text-fg tracking-tight">
          Prêt·e à <em className="hero-em">cultiver malin</em> ?
        </h2>
        <p className="font-body text-fg/80 mt-3 max-w-xl mx-auto">
          L&apos;app est gratuite pour commencer. Pas de carte bleue, pas de pub.
        </p>
        <div className="mt-6">
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex"
          >
            Ouvrir Kultiva <span className="text-lg">→</span>
          </a>
        </div>
      </section>
    </div>
  );
}
