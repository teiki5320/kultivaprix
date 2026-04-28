import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = "Kultivaprix — l'étal Kultiva en grand sur le web";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Default Open Graph image for any page that doesn't override it.
 * Uses inline SVG/CSS — no font fetch needed (system fonts via fontFamily).
 */
export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 80,
          background:
            'linear-gradient(135deg, #FCF4E1 0%, #FFE8A3 50%, #A8D5A2 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#3D4A3D',
              letterSpacing: '-0.01em',
            }}
          >
            kultivaprix.com
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: '#3D4A3D',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            L&apos;étal Kultiva
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: '#D17A4E',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            }}
          >
            en grand sur le web.
          </div>
          <div style={{ fontSize: 32, color: '#3D4A3D', marginTop: 24, fontWeight: 500, lineHeight: 1.3 }}>
            Le catalogue potager de l&apos;app Kultiva, à butiner depuis ton ordi.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {['🌱 Fiches espèces', '📅 Calendrier de semis', '🧺 Bilan du jardin', '🌍 France · Afrique'].map((t) => (
            <div
              key={t}
              style={{
                background: 'white',
                color: '#3D4A3D',
                fontSize: 22,
                fontWeight: 700,
                padding: '12px 22px',
                borderRadius: 999,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
