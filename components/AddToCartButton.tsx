'use client';

import { useEffect, useState } from 'react';
import { addToCart, removeFromCart, readCart } from '@/lib/cart';

export function AddToCartButton({
  slug,
  size = 'md',
}: {
  slug: string;
  size?: 'sm' | 'md';
}) {
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    setInCart(readCart().includes(slug));
    function onChange() {
      setInCart(readCart().includes(slug));
    }
    window.addEventListener('kp_cart_change', onChange);
    return () => window.removeEventListener('kp_cart_change', onChange);
  }, [slug]);

  function toggle() {
    if (inCart) removeFromCart(slug);
    else addToCart(slug);
    setInCart(!inCart);
  }

  const sizeCls =
    size === 'sm' ? '!py-2 !px-3 !text-sm' : '!py-3 !px-5 !text-base';

  return (
    <button
      onClick={toggle}
      className={inCart ? `btn-ghost ${sizeCls}` : `btn-brand ${sizeCls}`}
      aria-pressed={inCart}
      aria-label={inCart ? 'Retirer du panier' : 'Ajouter au panier'}
    >
      {inCart ? '✓ Dans mon panier' : '🧺 Ajouter au panier'}
    </button>
  );
}
