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
    default: "Kultivaprix — l'étal Kultiva en grand sur le web",
    template: '%s · Kultivaprix',
  },
  description:
    "Le catalogue potager de l'app Kultiva, en grand sur le web. 98 fiches espèces et accessoires : semis, exposition, calendrier de récolte. Companion web de l'app mobile.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kultivaprix.com'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Kultivaprix',
    description:
      "L'étal Kultiva, version web : toutes les espèces du potager à butiner depuis ton ordi. Calendrier de semis, fiches culture, bilan du prix de revient.",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Kultivaprix — l'étal Kultiva en grand sur le web",
    description:
      "Le catalogue potager de l'app Kultiva, version web. Fiches espèces, calendrier de semis, bilan du jardin.",
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
