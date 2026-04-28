import { amazonSearchUrl } from '@/lib/amazon';

interface Props {
  name: string;
  kind: 'species' | 'accessory';
  category?: string | null;
}

const TERRACOTTA = '#D88661';

/** Mini lien inline (en haut de fiche) — discret, pour ne pas voler la vedette au header. */
export function AmazonAffiliateInline({ name, kind, category }: Props) {
  const href = amazonSearchUrl(name, kind, category);
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold text-sm transition hover:scale-[1.02]"
      style={{
        background: `linear-gradient(135deg, ${TERRACOTTA}26, ${TERRACOTTA}40)`,
        color: TERRACOTTA,
        border: `1.5px solid ${TERRACOTTA}80`,
      }}
      title="Lien partenaire Amazon — Kultiva touche une petite commission si tu achètes."
    >
      <span aria-hidden>🛒</span>
      <span>Acheter</span>
      <span className="font-normal text-xs opacity-75">· Amazon</span>
    </a>
  );
}

/** Gros bouton plein (en bas de fiche) — l'action principale. */
export function AmazonAffiliateButton({ name, kind, category }: Props) {
  const href = amazonSearchUrl(name, kind, category);
  return (
    <div className="text-center">
      <a
        href={href}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-body font-bold text-base text-white transition hover:scale-[1.02]"
        style={{
          background: TERRACOTTA,
          boxShadow: `0 6px 0 ${TERRACOTTA}99, 0 14px 30px -10px rgba(0,0,0,.25)`,
        }}
      >
        <span aria-hidden className="text-xl">🛒</span>
        <span>Acheter sur Amazon</span>
      </a>
      <p className="font-body text-xs text-fg-muted mt-3">
        Lien partenaire · Kultiva touche une petite commission si tu achètes, sans surcoût pour toi.
      </p>
    </div>
  );
}
