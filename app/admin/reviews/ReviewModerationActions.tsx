'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ReviewModerationActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(decision: 'approve' | 'reject') {
    setBusy(true);
    try {
      await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => act('approve')}
        className="btn-brand !py-2 !px-4 !text-sm"
      >
        ✓ Publier
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => act('reject')}
        className="btn-ghost !py-2 !px-4 !text-sm"
      >
        ✕ Rejeter
      </button>
    </>
  );
}
