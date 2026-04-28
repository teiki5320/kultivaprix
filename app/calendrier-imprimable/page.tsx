import type { Metadata } from 'next';
import { CALENDAR, MONTHS } from '@/lib/calendar';

export const metadata: Metadata = {
  title: 'Calendrier de semis imprimable',
  description: 'Calendrier annuel de semis et récoltes au format imprimable A4. France métropolitaine.',
  alternates: { canonical: '/calendrier-imprimable' },
};

export default function CalendrierImprimablePage() {
  return (
    <div className="flex flex-col gap-6 print:gap-3">
      <div className="text-center print:hidden">
        <span className="kicker">🖨 Imprimable</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mt-3">
          Calendrier de semis A4
        </h1>
        <p className="font-body text-fg-muted max-w-xl mx-auto mt-2">
          Une page A4, à coller sur le frigo. Utilise <kbd>⌘/Ctrl + P</kbd> et choisis « A4 portrait,
          marges minimales » pour un rendu propre.
        </p>
        <button
          type="button"
          className="btn-primary mt-4"
          // eslint-disable-next-line @next/next/no-html-link-for-pages
        >
          <a href="javascript:window.print()" className="!text-white !no-underline">🖨 Imprimer</a>
        </button>
      </div>

      <div className="print:m-0 print:p-0">
        <div className="text-center mb-3">
          <h2 className="font-display text-2xl font-bold text-fg">
            Kultivaprix · Calendrier de semis & récoltes
          </h2>
          <p className="font-body text-xs text-fg-muted">France métropolitaine · climat tempéré</p>
        </div>

        <table className="w-full text-[11px] font-body border border-fg/20 print:border-black">
          <thead>
            <tr className="bg-cream-warm print:bg-gray-100">
              <th className="px-2 py-1 text-left font-display font-bold text-fg w-20">Mois</th>
              <th className="px-2 py-1 text-left font-display font-bold text-fg">À semer</th>
              <th className="px-2 py-1 text-left font-display font-bold text-fg">À récolter</th>
            </tr>
          </thead>
          <tbody>
            {MONTHS.map((m, i) => (
              <tr key={m.slug} className={i % 2 === 0 ? 'bg-white' : 'bg-cream-surface print:bg-white'}>
                <td className="px-2 py-2 font-display font-bold text-fg align-top">
                  {m.emoji} {m.label}
                </td>
                <td className="px-2 py-2 align-top">
                  {CALENDAR[m.slug].semer.map((s) => `${s.emoji} ${s.label}`).join(' · ') || '—'}
                </td>
                <td className="px-2 py-2 align-top">
                  {CALENDAR[m.slug].recolter.map((r) => `${r.emoji} ${r.label}`).join(' · ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="font-body text-[10px] text-fg-muted mt-3 print:mt-1">
          🌱 Adapté à ta région avec l&apos;app Kultiva · kultivaprix.com
        </p>
      </div>
    </div>
  );
}
