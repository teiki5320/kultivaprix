import type { Metadata } from 'next';
import Image from 'next/image';
import './styles.css';

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "L'app Kultiva · ton copain potager au creux de la main",
  description:
    "Calendrier de semis selon ta région, Poussidex évolutif, tutos vidéo, météo jardin : l'app Kultiva t'accompagne au quotidien sur iOS et Android.",
  alternates: { canonical: '/app' },
};

const APP_STORE_URL =
  process.env.NEXT_PUBLIC_KULTIVA_APPSTORE_URL ??
  'https://apps.apple.com/fr/search?term=kultiva';
const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_KULTIVA_PLAYSTORE_URL ??
  'https://play.google.com/store/search?q=kultiva&c=apps';

const FEATURES = [
  {
    icon: '📅',
    title: 'Calendrier de semis',
    body: "Adapté à ta région : métropole, outre-mer ou Afrique de l'Ouest. Semer au bon moment, récolter sans stress.",
    accent: 'a' as const,
  },
  {
    icon: '💧',
    title: 'Rappels doux',
    body: "Arrosage, fertilisation, taille — on te prévient sans te harceler. Une petite notif chaleureuse et rien d'autre.",
    accent: 'b' as const,
  },
  {
    icon: '🌦',
    title: 'Météo potager',
    body: "Vent de sable, canicule, gel tardif : on traduit la météo en gestes utiles pour tes plantations.",
    accent: 'c' as const,
  },
  {
    icon: '🏆',
    title: 'Défis & badges',
    body: "50 badges peints à la main — de « Premier pas » à « Quatre saisons ». Récompenses qui te donnent le sourire.",
    accent: 'a' as const,
  },
  {
    icon: '📚',
    title: 'Tutos pas à pas',
    body: "Bouturer le manioc, pincer le basilic, semer la tomate. Des tutos courts, écrits par des jardiniers.",
    accent: 'b' as const,
  },
  {
    icon: '🌍',
    title: 'Deux continents',
    body: "Variétés locales : gombo, niébé, aubergine africaine — ou artichaut, endive, cardon. Ton potager parle ta langue.",
    accent: 'c' as const,
  },
];

const VEG_TAGS = [
  { em: '🌶', n: 'Gombo' },
  { em: '🫘', n: 'Niébé' },
  { em: '🥔', n: 'Manioc' },
  { em: '🍆', n: 'Aubergine africaine' },
  { em: '🍅', n: 'Tomate cerise' },
  { em: '🥕', n: 'Carotte' },
  { em: '🌽', n: 'Maïs' },
  { em: '🥬', n: 'Laitue beurre' },
  { em: '🫑', n: 'Poivron' },
];

const STEPS = [
  { n: 1, title: 'Installe',           body: "Gratuit sur iOS et Android. 12 Mo, zéro pub, zéro tracking." },
  { n: 2, title: 'Choisis ta région',  body: "Métropole, outre-mer, Afrique de l'Ouest — ton calendrier s'adapte." },
  { n: 3, title: 'Plante ta graine',   body: "Sélectionne un légume, la date, et reçois tes premiers rappels doux." },
  { n: 4, title: 'Récolte & souris',   body: "Chaque geste fait grandir ton Poussidex. Et ton panier aussi." },
];

const TESTIS = [
  {
    text: "Pour la première fois, j'ai réussi mes tomates. Les rappels d'arrosage sont arrivés au bon moment, sans être intrusifs. Et Poussia me fait sourire chaque matin.",
    avatar: '👩🏻',
    name: 'Camille L.',
    role: 'Balcon lyonnais · 3 m²',
  },
  {
    text: "J'ai enfin trouvé une app qui connaît le gombo et le niébé ! Les conseils sont adaptés à notre saison sèche, pas recopiés d'un guide européen.",
    avatar: '👩🏿',
    name: 'Awa D.',
    role: 'Dakar · Jardin familial',
  },
  {
    text: "Mes enfants adorent collectionner les badges. On plante ensemble le samedi matin, et c'est devenu notre rituel. Merci Kultiva 🌱",
    avatar: '👨🏽',
    name: 'Marc B.',
    role: 'Jardin nantais · avec Léa (7 ans)',
  },
];

const BADGES = [
  { ico: '🌱', nm: 'Premier pas' },
  { ico: '💧', nm: 'Arrosage 1' },
  { ico: '🍂', nm: '4 saisons' },
  { ico: '🏆', nm: 'Niveau 50' },
  { ico: '🔥', nm: '30 jours' },
  { ico: '🧭', nm: 'Exploratrice' },
];

export default function AppPage() {
  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="app-hero">
        <div className="app-blob app-blob-1" />
        <div className="app-blob app-blob-2" />
        <div className="app-blob app-blob-3" />

        <div className="app-hero-grid">
          <div>
            <span className="eyebrow-pill">🌱 Ton copain potager kawaii</span>
            <h1>
              Cultive, soigne, <em>récolte</em> — avec ton petit compagnon.
            </h1>
            <p>
              Calendrier de semis adapté à ta région, rappels d&apos;arrosage, météo du potager
              et un Poussidex qui grandit avec toi. De Lyon à Dakar, Kultiva t&apos;accompagne
              saison après saison. 🌱
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Télécharger gratuit <span className="text-lg">→</span>
              </a>
              <a href="#features" className="btn-primary" style={{ background: 'white', color: 'var(--fg)', boxShadow: 'var(--shadow-md)' }}>
                Voir les fonctionnalités
              </a>
            </div>
          </div>

          <div className="app-hero-visual">
            <div className="app-hero-phone">
              <iframe
                src="/dashboard-tour/index.html"
                title="Visite guidée du tableau de bord Kultiva"
                loading="lazy"
              />
            </div>

            <div className="app-float app-float-1">
              <div className="em">🌿</div>
              <div>
                <div className="t">+3 plants arrosés</div>
                <div className="s">ce matin</div>
              </div>
            </div>
            <div className="app-float app-float-2">
              <div className="em">🏆</div>
              <div>
                <div className="t">Badge débloqué</div>
                <div className="s">Quatre saisons</div>
              </div>
            </div>
            <div className="app-float app-float-3">
              <div className="em">🌸</div>
              <div>
                <div className="t">Poussia Lv 28</div>
                <div className="s">elle te sourit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="app-trust">
        <div className="line">Déjà adoptée par les jardiniers francophones</div>
        <div className="stats">
          <div className="stat"><div className="big">120k+</div><div className="lbl">Jardiniers actifs</div></div>
          <div className="stat"><div className="big">340+</div><div className="lbl">Légumes dans l&apos;Étal</div></div>
          <div className="stat"><div className="big">50</div><div className="lbl">Badges à collectionner</div></div>
          <div className="stat"><div className="big">4,8 ★</div><div className="lbl">Sur l&apos;App Store</div></div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="app-section app-section-white" style={{ borderRadius: 32 }}>
        <div className="app-sec-head">
          <span className="kicker">🌟 Tout ton potager dans la poche</span>
          <h2>Ton jardin mérite une app qui lui sourit</h2>
          <p>
            Fini les post-it oubliés sur le frigo. Kultiva rassemble calendrier, arrosage et
            récolte dans un cocon tout doux.
          </p>
        </div>
        <div className="app-feat-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className={`app-feat app-feat-${f.accent}`}>
              <div className="ico">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SHOWCASE — POUSSIDEX */}
      <section className="app-section app-section-cream" style={{ borderRadius: 32, marginTop: 40 }}>
        <div className="app-showcase-grid">
          <div>
            <span className="kicker">🌱 Le Poussidex</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 3.5vw, 36px)', color: 'var(--fg)', margin: '12px 0 14px', lineHeight: 1.15 }}>
              Un compagnon qui grandit avec toi
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 16, color: 'var(--fg-muted)', lineHeight: 1.6, margin: '0 0 22px' }}>
              Chaque geste — arrosage, fertilisation, câlin — fait évoluer ton Poussia, Soleia
              ou Spira. Onze stades d&apos;évolution, cinquante badges, et un potager qui
              sourit un peu plus fort chaque semaine.
            </p>
            <ul className="app-showcase-list">
              <li><span className="chk">✓</span> 3 familles · Poussia, Soleia, Spira</li>
              <li><span className="chk">✓</span> 11 stades d&apos;évolution par créature</li>
              <li><span className="chk">✓</span> 50 badges peints à l&apos;aquarelle</li>
              <li><span className="chk">✓</span> Défis photo hebdomadaires</li>
            </ul>
          </div>
          <div>
            <div className="app-showcase-card app-tamassi-card">
              <div className="app-tamassi-stage">
                <Image
                  src="/app-poussidex.png"
                  alt="Le Poussidex de Kultiva"
                  width={280}
                  height={230}
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="app-tamassi-info">
                <div className="name">Poussia 🌱</div>
                <div className="lvl">NIVEAU 28 · 58% VERS LV 29</div>
                <div className="bar"><div /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE — BADGES */}
      <section className="app-section app-section-cream" style={{ borderRadius: 32, marginTop: 40 }}>
        <div className="app-showcase-grid reversed">
          <div>
            <span className="kicker kicker-terra">🏆 Badges</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 3.5vw, 36px)', color: 'var(--fg)', margin: '12px 0 14px', lineHeight: 1.15 }}>
              Chaque petit geste compte
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 16, color: 'var(--fg-muted)', lineHeight: 1.6, margin: '0 0 22px' }}>
              Premier arrosage, première récolte, traversée des quatre saisons — chaque
              étape t&apos;offre un badge illustré à la main. Une collection chaleureuse
              à accrocher fièrement à ton profil.
            </p>
            <ul className="app-showcase-list app-showcase-list-terra">
              <li><span className="chk">✓</span> Illustrations aquarelle originales</li>
              <li><span className="chk">✓</span> Progression jamais punitive</li>
              <li><span className="chk">✓</span> Partage sur tes réseaux en un tap</li>
            </ul>
          </div>
          <div>
            <div className="app-showcase-card">
              <div className="app-badges-grid">
                {BADGES.map((b) => (
                  <div key={b.nm} className="app-badge-card">
                    <span className="ico">{b.ico}</span>
                    <div className="nm">{b.nm}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REGIONAL */}
      <section className="app-section app-section-brand app-regional" style={{ borderRadius: 32, marginTop: 40 }}>
        <div className="app-showcase-grid app-regional-inner">
          <div>
            <span className="kicker" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>🌍 France · Afrique de l&apos;Ouest</span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 3.5vw, 40px)', color: 'white', margin: '12px 0 14px', lineHeight: 1.1 }}>
              Ton potager, ton climat, ta langue.
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 16, color: 'white', opacity: 0.92, lineHeight: 1.6, margin: '0 0 22px' }}>
              Kultiva comprend que semer à Nantes n&apos;est pas la même chose que semer à
              Bamako. Variétés locales, saisons adaptées, variétés tropicales — tout est
              pensé pour ta réalité.
            </p>
            <div className="veg-cloud">
              {VEG_TAGS.map((v) => (
                <div key={v.n} className="veg-tag">
                  <span className="em">{v.em}</span>
                  {v.n}
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div className="region-card" aria-hidden>
              🌳
            </div>
            <div className="region-badge app-rb1">
              <span className="em">☀️</span>
              <div>Saison sèche<br /><span style={{ fontWeight: 500, opacity: 0.6, fontSize: 11 }}>Sahel · 34 °C</span></div>
            </div>
            <div className="region-badge app-rb2">
              <span className="em">💧</span>
              <div>Arrosage à l&apos;aube<br /><span style={{ fontWeight: 500, opacity: 0.6, fontSize: 11 }}>Rappel demain 6 h</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="app-section">
        <div className="app-sec-head">
          <span className="kicker">🌱 Comment ça marche</span>
          <h2>Quatre pas pour démarrer</h2>
          <p>Installe, choisis ta région, plante ta première graine — et laisse Poussia t&apos;accompagner.</p>
        </div>
        <div className="app-steps-grid">
          {STEPS.map((s) => (
            <div key={s.n} className="app-step">
              <div className="num">{s.n}</div>
              <h4>{s.title}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="app-section app-section-cream" style={{ borderRadius: 32, marginTop: 40 }}>
        <div className="app-sec-head">
          <span className="kicker">💚 Ce qu&apos;en disent les jardiniers</span>
          <h2>Un compagnon, pas un coach</h2>
        </div>
        <div className="app-testi-grid">
          {TESTIS.map((t) => (
            <div key={t.name} className="app-testi">
              <div className="quote">&ldquo;</div>
              <p>{t.text}</p>
              <div className="who">
                <div className="avatar">{t.avatar}</div>
                <div>
                  <div className="n">{t.name}</div>
                  <div className="r">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="app-final-cta">
        <h2>Prêt·e à <em style={{ fontStyle: 'normal', color: 'var(--brand-dark)' }}>semer ton premier sourire</em> ?</h2>
        <p>Gratuit. Sans pub. Sans tracking. Juste toi, tes graines, et Poussia.</p>
        <div className="app-store-btns">
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="app-store-btn" aria-label="Télécharger sur l'App Store">
            <svg width="24" height="28" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <div className="txt"><div className="t1">Télécharger sur</div><div className="t2">App Store</div></div>
          </a>
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="app-store-btn" aria-label="Télécharger sur Google Play">
            <svg width="22" height="24" viewBox="0 0 512 512" aria-hidden>
              <path fill="#34A853" d="m325.3 234.3-242 138.4 197.7-197.6 44.3 59.2z" />
              <path fill="#FBBC04" d="M409.2 234.4 322.5 200l-19 30 19 30 86.7-25.6c14.7-8.4 14.7-24.1 0-32.5z" />
              <path fill="#EA4335" d="M83.3 137.5c-1.8 1-3.3 2.3-3.3 4.6v370c0 2.3 1.5 3.6 3.3 4.6l173.8-187z" />
              <path fill="#4285F4" d="m83.3 137.5 197.7-101.4 44.3 59.2-242 138.4z" />
            </svg>
            <div className="txt"><div className="t1">Disponible sur</div><div className="t2">Google Play</div></div>
          </a>
        </div>
      </section>
    </div>
  );
}
