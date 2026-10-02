/**
 * The admin panel is only ever served on the "admin." subdomain (e.g.
 * admin.yourdomain.com, or admin.localhost:3000 in local dev). Everything
 * here checks the incoming Host header rather than the URL path, so the
 * admin UI and its mutating API routes are unreachable from the public
 * domain even if someone guesses the path.
 */
export const ADMIN_HOST_PREFIX = "admin.";

export function isAdminHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const bare = host.split(":")[0]; // strip a dev port, e.g. admin.localhost:3000
  return bare.startsWith(ADMIN_HOST_PREFIX);
}
