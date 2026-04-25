'use client';

import { useRouter } from 'next/navigation';
import { writeCart, readCart } from '@/lib/cart';

export function ImportKitButton({ slugs }: { slugs: string[] }) {
  const router = useRouter();
  function importKit() {
    const merged = Array.from(new Set([...readCart(), ...slugs]));
    writeCart(merged);
    router.push('/panier');
  }
  return (
    <button onClick={importKit} className="btn-primary">
      🧺 Importer ce kit dans mon panier ({slugs.length})
    </button>
  );
}
