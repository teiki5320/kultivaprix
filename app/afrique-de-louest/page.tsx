import type { Metadata } from 'next';
import Link from 'next/link';
import { CTAKultiva } from '@/components/CTAKultiva';

export const metadata: Metadata = {
  title: 'Potager en Afrique de l\'Ouest',
  description: 'Variétés tropicales, calendrier saison sèche / saison des pluies, marchands francophones livrant en Afrique de l\'Ouest.',
};

const VARIETES = [
  { name: 'Gombo', emoji: '🌶️', query: 'gombo', note: 'Aime la chaleur, productif toute la saison sèche.' },
  { name: 'Niébé', emoji: '🫘', query: 'niebe', note: 'Fixe l\'azote, parfait pour préparer un sol pauvre.' },
  { name: 'Manioc', emoji: '🥔', query: 'manioc', note: 'Bouturage simple, récolte 8-12 mois.' },
  { name: 'Aubergine africaine', emoji: '🍆', query: 'aubergine africaine', note: 'Variétés Diakhité, Soxna — plus rustiques.' },
  { name: 'Sorgho', emoji: '🌾', query: 'sorgho', note: 'Céréale tolérante à la sécheresse.' },
  { name: 'Mil', emoji: '🌾', query: 'mil', note: 'Adapté aux sols pauvres et sableux.' },
  { name: 'Pastèque', emoji: '🍉', query: 'pasteque', note: 'Saison des pluies, paillage généreux.' },
  { name: 'Bissap (oseille de Guinée)', emoji: '🌺', query: 'bissap', note: 'Calices pour les boissons, feuilles pour les sauces.' },
];

export default function AfriquePage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="text-center pt-4">
        <span className="kicker">🌍 Afrique de l&apos;Ouest</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3">
          Potager <em className="hero-em">tropical</em>, langue française
        </h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-4">
          Kultivaprix recense les marchands de graines francophones qui expédient en Afrique
          de l&apos;Ouest, et liste les variétés locales adaptées au climat sahélien et soudanien.
        </p>
      </header>

      <section>
        <span className="kicker">🌶️ Variétés du quotidien</span>
        <h2 className="font-display text-3xl font-bold mt-3 mb-4 text-fg">8 incontournables</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VARIETES.map((v) => (
            <Link
              key={v.query}
              href={`/recherche?q=${encodeURIComponent(v.query)}`}
              className="card-cream text-center no-underline transition hover:-translate-y-1 hover:shadow-leaf"
            >
              <div className="text-4xl">{v.emoji}</div>
              <div className="font-display font-bold text-base mt-2 text-fg">{v.name}</div>
              <p className="font-body text-xs text-fg-muted mt-2 leading-snug">{v.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="card-cream">
        <span className="kicker">📅 Saisons</span>
        <h2 className="font-display text-2xl font-bold text-fg mt-2 mb-3">Saison sèche & saison des pluies</h2>
        <div className="grid md:grid-cols-2 gap-4 text-fg">
          <div>
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--terracotta-deep)' }}>
              ☀️ Saison sèche (nov → mai)
            </h3>
            <p className="font-body text-sm text-fg-muted mt-2 leading-relaxed">
              Privilégie les cultures résistantes : gombo, niébé, sorgho, mil, oignon, tomate avec
              irrigation matin/soir et paillage épais.
            </p>
          </div>
          <div>
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--brand-dark)' }}>
              💧 Saison des pluies (juin → oct)
            </h3>
            <p className="font-body text-sm text-fg-muted mt-2 leading-relaxed">
              C&apos;est le moment du maïs, de la pastèque, du bissap, de l&apos;arachide. Attention aux
              maladies fongiques : aération et rotations.
            </p>
          </div>
        </div>
      </section>

      <CTAKultiva context="afrique-de-louest" />
    </div>
  );
}
