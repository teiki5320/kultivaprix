import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/app-stores';

interface Props {
  /** `default` (h ≈ 52px) pour les CTA importants, `sm` (h ≈ 40px) pour le footer / inline. */
  size?: 'default' | 'sm';
  /** Optionnelles classes Tailwind à ajouter au conteneur. */
  className?: string;
}

export function AppStoreBadges({ size = 'default', className = '' }: Props) {
  const heightPx = size === 'sm' ? 40 : 52;
  const labelTopSize = size === 'sm' ? 'text-[9px]' : 'text-[10px]';
  const labelMainSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className={`flex flex-wrap gap-3 items-center ${className}`}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Télécharger Kultiva sur l'App Store"
        className="inline-flex items-center gap-2 bg-black text-white rounded-xl no-underline transition hover:opacity-85"
        style={{ height: heightPx, padding: '0 16px' }}
      >
        <svg
          width={size === 'sm' ? 16 : 20}
          height={size === 'sm' ? 20 : 24}
          viewBox="0 0 384 512"
          fill="currentColor"
          aria-hidden
        >
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
        </svg>
        <div className="flex flex-col leading-tight text-left">
          <span className={`${labelTopSize} opacity-80`}>Télécharger dans</span>
          <span className={`${labelMainSize} font-semibold tracking-tight`}>App Store</span>
        </div>
      </a>

      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Télécharger Kultiva sur Google Play"
        className="inline-flex items-center gap-2 bg-black text-white rounded-xl no-underline transition hover:opacity-85"
        style={{ height: heightPx, padding: '0 16px' }}
      >
        <svg
          width={size === 'sm' ? 16 : 20}
          height={size === 'sm' ? 18 : 22}
          viewBox="0 0 512 512"
          aria-hidden
        >
          <path
            fill="#34A853"
            d="m325.3 234.3-242 138.4 197.7-197.6 44.3 59.2z"
          />
          <path
            fill="#FBBC04"
            d="M409.2 234.4 322.5 200l-19 30 19 30 86.7-25.6c14.7-8.4 14.7-24.1 0-32.5z"
          />
          <path
            fill="#EA4335"
            d="M83.3 137.5c-1.8 1-3.3 2.3-3.3 4.6v370c0 2.3 1.5 3.6 3.3 4.6l173.8-187z"
          />
          <path
            fill="#4285F4"
            d="m83.3 137.5 197.7-101.4 44.3 59.2-242 138.4z"
          />
        </svg>
        <div className="flex flex-col leading-tight text-left">
          <span className={`${labelTopSize} opacity-80`}>Disponible sur</span>
          <span className={`${labelMainSize} font-semibold tracking-tight`}>Google Play</span>
        </div>
      </a>
    </div>
  );
}
