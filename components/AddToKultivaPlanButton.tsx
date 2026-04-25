'use client';

import { useEffect, useState } from 'react';
import { buildKultivaLink, buildKultivaDeepLink, REFERRAL_COOKIE } from '@/lib/kultiva-link';

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : undefined;
}

interface Props {
  productSlug?: string;
  month?: number;
  campaign: string;
  label?: string;
}

export function AddToKultivaPlanButton({ productSlug, month, campaign, label }: Props) {
  const [ref, setRef] = useState<string | undefined>();
  useEffect(() => { setRef(readCookie(REFERRAL_COOKIE)); }, []);

  function open() {
    const deep = buildKultivaDeepLink({ productSlug, month, ref });
    const fallback = buildKultivaLink({ productSlug, month, campaign, ref });
    if (typeof window === 'undefined') return;

    // Try the deep link first, fallback to the https URL after a short delay.
    const start = Date.now();
    const timer = setTimeout(() => {
      if (Date.now() - start < 1500) window.location.href = fallback;
    }, 800);
    window.addEventListener('blur', () => clearTimeout(timer), { once: true });
    window.location.href = deep;
  }

  return (
    <button onClick={open} className="btn-brand">
      🌱 {label ?? 'Ajouter au planning Kultiva'}
    </button>
  );
}
