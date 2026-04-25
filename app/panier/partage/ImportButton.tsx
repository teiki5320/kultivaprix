'use client';

import { useRouter } from 'next/navigation';
import { writeCart } from '@/lib/cart';

export function ImportButton({ slugs }: { slugs: string[] }) {
  const router = useRouter();
  function importCart() {
    writeCart(slugs);
    router.push('/panier');
  }
  if (slugs.length === 0) return null;
  return (
    <div className="flex justify-center">
      <button onClick={importCart} className="btn-primary">
        🧺 Importer dans mon panier ({slugs.length})
      </button>
    </div>
  );
}
