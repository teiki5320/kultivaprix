import type { Metadata } from 'next';
import BudgetClient from './BudgetClient';

export const metadata: Metadata = {
  title: 'Budget potager : combien prévoir pour ton premier jardin ?',
  description:
    'Calcule un budget potager selon ta surface et le nombre de variétés. On te propose un kit clé-en-main et le coût estimé chez nos marchands.',
  alternates: { canonical: '/budget' },
};

export default function BudgetPage() {
  return <BudgetClient />;
}
