import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-kawaii-pink-50 border-b border-kawaii-pink-100">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span aria-hidden className="text-3xl">🌷</span>
          <span className="font-display text-2xl font-extrabold text-kawaii-green-600">
            Kultiva<span className="text-kawaii-pink-500">prix</span>
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/graines" className="hover:underline">Graines</Link>
          <Link href="/plants" className="hover:underline">Plants</Link>
          <Link href="/outils" className="hover:underline">Outils</Link>
          <Link href="/recherche" className="pill bg-kawaii-green-100 text-kawaii-green-600 hover:bg-kawaii-green-200">🔎 Rechercher</Link>
        </nav>
      </div>
    </header>
  );
}
