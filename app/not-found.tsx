import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center text-center py-16 gap-4">
      <div className="text-7xl">🌱</div>
      <h1 className="font-display text-3xl font-extrabold text-kawaii-green-600">
        Page introuvable
      </h1>
      <p className="text-kawaii-ink/80">Cette graine n&apos;a pas encore germé.</p>
      <Link href="/" className="btn-kawaii">Retour à l&apos;accueil</Link>
    </div>
  );
}
