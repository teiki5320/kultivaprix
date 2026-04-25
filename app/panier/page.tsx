import type { Metadata } from 'next';
import { CartView } from './CartView';

export const metadata: Metadata = {
  title: 'Mon panier',
  description: 'Le panier optimisé entre marchands : on calcule le total minimal frais de port inclus.',
};

export default function PanierPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <span className="kicker">🧺 Mon panier</span>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3">
          Le <em className="hero-em">meilleur split</em> entre marchands
        </h1>
        <p className="font-body text-fg-muted max-w-2xl mt-3">
          Plus tu ajoutes de produits, plus on cherche le total optimal. Souvent il est moins cher
          de tout prendre chez un seul marchand grâce aux frais de port partagés.
        </p>
      </header>

      <CartView />
    </div>
  );
}
