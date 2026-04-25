'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readCart } from '@/lib/cart';

export function CartLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function refresh() { setCount(readCart().length); }
    refresh();
    window.addEventListener('kp_cart_change', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('kp_cart_change', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <Link
      href="/panier"
      className="relative font-body font-bold text-fg hover:text-brand-dark transition px-2"
      aria-label={`Mon panier, ${count} article${count > 1 ? 's' : ''}`}
    >
      🧺
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 text-[10px] font-bold rounded-full w-4 h-4 inline-flex items-center justify-center text-white"
          style={{ background: 'var(--terracotta-deep)' }}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
