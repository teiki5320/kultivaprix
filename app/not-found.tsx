import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center text-center py-20 gap-5">
      <div className="text-7xl">🌱</div>
      <span className="kicker">404</span>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-fg">
        Cette <em className="hero-em">graine</em> n&apos;a pas germé
      </h1>
      <p className="font-body text-fg-muted max-w-md">
        La page que tu cherches est introuvable. Elle a peut-être été déplacée, ou n&apos;a jamais existé.
      </p>
      <Link href="/" className="btn-primary mt-2">Retour à l&apos;accueil →</Link>
    </div>
  );
}
