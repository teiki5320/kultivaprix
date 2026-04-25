/**
 * Render a French "il y a Xh" relative-time string from a date.
 * Pure function so it works in server components AND in client code without RSC boundary issues.
 */
export function formatRelativeFR(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  if (diff < 0) return "à l'instant";

  const sec = Math.floor(diff / 1_000);
  if (sec < 60) return "à l'instant";

  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;

  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;

  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  if (d < 30) return `il y a ${Math.floor(d / 7)} sem`;
  if (d < 365) return `il y a ${Math.floor(d / 30)} mois`;

  const years = Math.floor(d / 365);
  return `il y a ${years} an${years > 1 ? 's' : ''}`;
}
