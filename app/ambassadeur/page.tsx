import type { Metadata } from 'next';
import Link from 'next/link';
import { CTAKultiva } from '@/components/CTAKultiva';

export const metadata: Metadata = {
  title: 'Programme ambassadeur',
  description: 'Partage Kultivaprix et fais grandir la communauté de jardinier·es francophones.',
};

interface Props {
  searchParams: { ref?: string };
}

export default function AmbassadorPage({ searchParams }: Props) {
  const ref = searchParams.ref;
  return (
    <div className="flex flex-col gap-10">
      <header className="text-center pt-4">
        <span className="kicker">🌱 Programme ambassadeur</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3">
          Cultive aussi ta <em className="hero-em">communauté</em>
        </h1>
        <p className="font-body text-fg-muted max-w-2xl mx-auto mt-4">
          Tu jardines, tu partages. Quand un·e ami·e arrive ici via ton lien, il/elle est compté·e dans ton compteur — et profite des mêmes prix.
        </p>
      </header>

      {ref && (
        <div className="card-cream text-center" style={{ background: 'color-mix(in oklab, var(--brand) 12%, white)' }}>
          <span className="kicker">🌿 Lien actif</span>
          <p className="font-display text-xl font-bold text-fg mt-2">
            Tu es avec l&apos;ambassadeur·rice <code className="font-body" style={{ color: 'var(--terracotta-deep)' }}>{ref}</code>
          </p>
          <p className="font-body text-sm text-fg-muted mt-2">
            Ton prochain téléchargement de l&apos;app Kultiva sera attribué à cette personne.
          </p>
        </div>
      )}

      <section className="grid md:grid-cols-3 gap-4">
        {[
          { num: '1', title: 'Tu jardines', body: 'Tu utilises Kultivaprix et l’app Kultiva pour ton potager.' },
          { num: '2', title: 'Tu partages', body: 'Ton lien parrain est /amb/<ton-pseudo>. Chaque clic compte.' },
          { num: '3', title: 'On te remercie', body: 'Stickers, kit de graines paysannes, accès anticipé aux nouveautés.' },
        ].map((s) => (
          <article key={s.num} className="card-cream text-center">
            <div className="font-display text-3xl font-bold" style={{ color: 'var(--brand-dark)' }}>{s.num}</div>
            <div className="font-display text-lg font-bold text-fg mt-2">{s.title}</div>
            <p className="font-body text-sm text-fg-muted mt-2">{s.body}</p>
          </article>
        ))}
      </section>

      <aside className="card-cream">
        <span className="kicker">📬 Comment ça démarre</span>
        <p className="font-body text-fg mt-2 leading-relaxed">
          Le programme est en bêta. Écris-nous depuis le pied de page pour recevoir ton code et ton kit
          de bienvenue. Pas de quota, pas de pression.
        </p>
        <p className="font-body text-fg-muted mt-2 text-sm">
          Lien type : <code>kultivaprix.com/amb/<strong>ton-pseudo</strong></code>
        </p>
      </aside>

      <CTAKultiva context="ambassadeur" />

      <div className="text-center">
        <Link href="/" className="font-body text-sm font-bold" style={{ color: 'var(--terracotta-deep)' }}>
          ← Retour au comparateur
        </Link>
      </div>
    </div>
  );
}
