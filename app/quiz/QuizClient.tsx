'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toSlug } from '@/lib/utils';

type Exposure = 'soleil' | 'mi-ombre' | 'ombre';
type Space = 'balcon' | 'petit' | 'grand';
type Time = 'peu' | 'moyen' | 'beaucoup';

interface Suggestion { name: string; emoji: string; query: string; why: string }

const RULES: { match: (a: { exposure: Exposure; space: Space; time: Time }) => Suggestion[] } = {
  match: ({ exposure, space, time }) => {
    const out: Suggestion[] = [];

    if (space === 'balcon') {
      out.push({ name: 'Tomate cerise', emoji: '🍅', query: 'tomate cerise', why: 'Parfait en pot, productif sur balcon ensoleillé.' });
      out.push({ name: 'Basilic', emoji: '🌿', query: 'basilic', why: 'Compagnon idéal de la tomate, peu d’entretien.' });
      out.push({ name: 'Radis', emoji: '🌶️', query: 'radis', why: 'Pousse vite (1 mois), fait plaisir aux débutants.' });
      if (exposure !== 'ombre') {
        out.push({ name: 'Fraise', emoji: '🍓', query: 'fraise', why: 'En jardinière, aime un peu de soleil.' });
      } else {
        out.push({ name: 'Mâche', emoji: '🥬', query: 'mache', why: 'Tolère bien la mi-ombre et le balcon nord.' });
      }
      return out;
    }

    if (exposure === 'soleil') {
      out.push({ name: 'Tomate', emoji: '🍅', query: 'tomate', why: 'Adore le plein soleil et chauffe les fruits.' });
      out.push({ name: 'Courgette', emoji: '🥒', query: 'courgette', why: 'Très productive, peu d’entretien.' });
      if (time !== 'peu') {
        out.push({ name: 'Aubergine', emoji: '🍆', query: 'aubergine', why: 'Demande arrosage régulier, mais récompense.' });
        out.push({ name: 'Poivron', emoji: '🫑', query: 'poivron', why: 'Bien adapté au plein soleil et chaleur.' });
      } else {
        out.push({ name: 'Carotte', emoji: '🥕', query: 'carotte', why: 'Peu d’entretien après semis.' });
      }
    } else if (exposure === 'mi-ombre') {
      out.push({ name: 'Salade', emoji: '🥬', query: 'laitue', why: 'Préfère ne pas griller en plein soleil.' });
      out.push({ name: 'Persil', emoji: '🌿', query: 'persil', why: 'Bisannuel, très tolérant.' });
      out.push({ name: 'Épinard', emoji: '🥬', query: 'epinard', why: 'Aime la fraîcheur, monte au soleil.' });
    } else {
      out.push({ name: 'Mâche', emoji: '🥬', query: 'mache', why: 'Idéal coin frais et ombragé.' });
      out.push({ name: 'Rhubarbe', emoji: '🌿', query: 'rhubarbe', why: 'Vivace, accepte la mi-ombre.' });
      out.push({ name: 'Ail des ours', emoji: '🌿', query: 'ail', why: 'Sous-bois, ombre fraîche.' });
    }

    if (space === 'grand' && time !== 'peu') {
      out.push({ name: 'Courge', emoji: '🎃', query: 'courge', why: 'Demande de la place mais peu de soin.' });
      out.push({ name: 'Pomme de terre', emoji: '🥔', query: 'pomme de terre', why: 'Productif, parfait pour grand potager.' });
    }

    return out.slice(0, 6);
  },
};

const STEPS = [
  { key: 'exposure' as const, q: "Quelle est l'exposition de ton coin ?", options: [
    { v: 'soleil' as Exposure, label: 'Plein soleil ☀️' },
    { v: 'mi-ombre' as Exposure, label: 'Mi-ombre 🌤️' },
    { v: 'ombre' as Exposure, label: 'Ombragé 🌫️' },
  ] },
  { key: 'space' as const, q: 'De combien de place disposes-tu ?', options: [
    { v: 'balcon' as Space, label: 'Balcon / pots 🪴' },
    { v: 'petit' as Space, label: 'Petit potager (5–15 m²) 🌱' },
    { v: 'grand' as Space, label: 'Grand potager (>15 m²) 🌾' },
  ] },
  { key: 'time' as const, q: 'Combien de temps tu peux y consacrer ?', options: [
    { v: 'peu' as Time, label: 'Très peu — 5 min/jour ⏱' },
    { v: 'moyen' as Time, label: 'Moyen — 30 min 2×/sem 🌿' },
    { v: 'beaucoup' as Time, label: 'Beaucoup — 1h/jour 🍅' },
  ] },
];

export default function QuizClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{ exposure?: Exposure; space?: Space; time?: Time }>({});

  function answer(value: any) {
    const key = STEPS[step].key;
    const next = { ...answers, [key]: value };
    setAnswers(next);
    setStep((s) => s + 1);
  }

  function reset() {
    setStep(0);
    setAnswers({});
  }

  if (step >= STEPS.length) {
    const suggestions = RULES.match(answers as any);
    return (
      <div className="flex flex-col gap-8">
        <header className="text-center">
          <span className="kicker">✨ Ton potager idéal</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-fg mt-3">
            Que <em className="hero-em">planter</em> chez toi : nos suggestions
          </h1>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {suggestions.map((s) => (
            <Link
              key={s.query}
              href={`/espece/${toSlug(s.query)}`}
              className="card-cream no-underline transition hover:-translate-y-1 hover:shadow-leaf flex flex-col gap-2"
            >
              <div className="text-5xl">{s.emoji}</div>
              <div className="font-display font-bold text-xl text-fg">{s.name}</div>
              <p className="font-body text-sm text-fg-muted leading-snug">{s.why}</p>
              <span className="font-body font-bold text-sm mt-auto" style={{ color: 'var(--terracotta-deep)' }}>
                Voir la fiche →
              </span>
            </Link>
          ))}
        </section>

        <div className="flex justify-center gap-3">
          <button onClick={reset} className="btn-ghost">Refaire le quiz</button>
          <Link href="/" className="btn-primary">Retour à l’accueil</Link>
        </div>
      </div>
    );
  }

  const current = STEPS[step];

  return (
    <div className="flex flex-col gap-8 max-w-xl mx-auto">
      <header className="text-center">
        <span className="kicker">🌱 Quiz · {step + 1}/{STEPS.length}</span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mt-3">
          {current.q}
        </h1>
      </header>

      <div className="flex flex-col gap-3">
        {current.options.map((o) => (
          <button
            key={o.label}
            onClick={() => answer(o.v)}
            className="card-cream text-left transition hover:-translate-y-0.5 hover:shadow-leaf font-display font-bold text-lg text-fg"
          >
            {o.label}
          </button>
        ))}
      </div>

      {step > 0 && (
        <button onClick={() => setStep((s) => s - 1)} className="font-body text-sm font-bold mx-auto" style={{ color: 'var(--terracotta-deep)' }}>
          ← Question précédente
        </button>
      )}
    </div>
  );
}
