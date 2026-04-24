'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Point { date: string; price: number }

export function PriceHistoryChart({ points }: { points: Point[] }) {
  if (points.length < 2) {
    return (
      <div className="card-kawaii text-sm text-kawaii-ink/60">
        Pas encore assez d&apos;historique pour afficher la courbe des prix.
      </div>
    );
  }
  return (
    <div className="card-kawaii h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <CartesianGrid stroke="#FFE4EC" strokeDasharray="4 4" />
          <XAxis dataKey="date" stroke="#3B2A3A" fontSize={11} />
          <YAxis stroke="#3B2A3A" fontSize={11} tickFormatter={(v) => `${v}€`} />
          <Tooltip
            formatter={(v: number) => `${v.toFixed(2)} €`}
            contentStyle={{ borderRadius: 12, border: '1px solid #FFC9DA' }}
          />
          <Line type="monotone" dataKey="price" stroke="#FF5490" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
