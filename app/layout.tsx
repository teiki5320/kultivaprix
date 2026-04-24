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
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
