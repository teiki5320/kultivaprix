import type { Metadata } from 'next';
import { Fredoka, Quicksand, Nunito } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { organizationLd, websiteLd } from '@/lib/jsonld';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display-next',
  display: 'swap',
});
const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body-next',
  display: 'swap',
});
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-native-next',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Kultivaprix — comparateur de prix jardinage',
    template: '%s · Kultivaprix',
  },
  description:
    'Graines, plants, outils de jardinage : comparez les prix chez les marchands français. Mis à jour automatiquement plusieurs fois par jour.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kultivaprix.com'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Kultivaprix',
    description:
      'Comparateur neutre de graines, plants et outils. Prix mis à jour plusieurs fois par jour, alertes de baisse, calendrier de semis.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kultivaprix — comparateur de prix jardinage',
    description:
      'Compare en un clic les prix des graines, plants et outils chez les marchands jardinage français.',
  },
  alternates: {
    languages: {
      'fr-FR': '/',
      'fr-CI': '/',
      'fr-SN': '/',
      'fr-BJ': '/',
    },
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${quicksand.variable} ${nunito.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd()) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-cream-warm text-fg">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:btn-primary focus:!py-2 focus:!px-4 focus:!text-sm"
        >
          Aller au contenu
        </a>
        <Header />
        <main id="main" className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
