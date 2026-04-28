import type { Metadata } from 'next';
import QuizClient from './QuizClient';

export const metadata: Metadata = {
  title: 'Quiz : que planter dans mon potager ?',
  description:
    'En 3 questions (exposition, surface, temps disponible), on te suggère 4 à 6 variétés adaptées à ton coin et leurs fiches culture.',
  alternates: { canonical: '/quiz' },
};

export default function QuizPage() {
  return <QuizClient />;
}
