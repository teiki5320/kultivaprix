import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

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
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&family=Nunito:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
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
