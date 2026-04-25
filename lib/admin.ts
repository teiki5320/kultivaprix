import 'server-only';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'kp_admin';

export function getAdminSecret(): string | null {
  return process.env.KULTIVAPRIX_ADMIN_SECRET ?? null;
}

export function isAdminRequest(): boolean {
  const secret = getAdminSecret();
  if (!secret) return false; // explicit opt-in only
  const cookie = cookies().get(ADMIN_COOKIE)?.value;
  return cookie === secret;
}
