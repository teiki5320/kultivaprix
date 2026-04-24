'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Point { date: string; price: number }

export function PriceHistoryChart({ points }: { points: Point[] }) {
  if (points.length < 2) {
    return (
      <div className="card-cream font-body text-sm text-fg-muted">
        Pas encore assez d&apos;historique pour afficher la courbe des prix.
      </div>
    );
  }
  return (
    <div className="card-cream h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <CartesianGrid stroke="#F3EDD8" strokeDasharray="4 4" />
          <XAxis dataKey="date" stroke="#6B7A6F" fontSize={11} />
          <YAxis stroke="#6B7A6F" fontSize={11} tickFormatter={(v) => `${v}€`} />
          <Tooltip
            formatter={(v: number) => `${v.toFixed(2)} €`}
            contentStyle={{ borderRadius: 16, border: '1px solid #F3EDD8', background: '#FFF8E8' }}
          />
          <Line type="monotone" dataKey="price" stroke="#D17A4E" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
