import crypto from "crypto";
import fs from "fs";
import path from "path";

const AUTH_FILE = path.join(process.cwd(), "data", "admin-auth.json");
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export const SESSION_COOKIE_NAME = "ks_admin_session";

function getSecret(): string {
  // Set SESSION_SECRET in production (see README). This fallback is fine for local dev only.
  return process.env.SESSION_SECRET || "dev-insecure-secret-change-me";
}

function hashPassword(password: string, salt?: string) {
  const useSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, useSalt, 64).toString("hex");
  return { hash, salt: useSalt };
}

function ensureAuthFile(): { hash: string; salt: string } {
  if (!fs.existsSync(AUTH_FILE)) {
    // No password has been set yet (e.g. data/admin-auth.json was deleted).
    // Never fall back to a known default: generate a random one-time password,
    // store only its hash, and print it once to the server console.
    const initial = crypto.randomBytes(12).toString("base64url");
    const { hash, salt } = hashPassword(initial);
    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ hash, salt }, null, 2));
    console.warn(
      `\n[admin] No admin password was set. A temporary one was generated: ${initial}\n` +
        `[admin] Log in with it, then change it under Settings & Data.\n`
    );
    return { hash, salt };
  }
  return JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
}

/** Checks a plaintext password against the stored (scrypt) hash. */
export function verifyPassword(password: string): boolean {
  const { hash, salt } = ensureAuthFile();
  const check = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(check, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Overwrites the stored admin password. */
export function setPassword(newPassword: string): void {
  const { hash, salt } = hashPassword(newPassword);
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ hash, salt }, null, 2));
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** Creates a signed, stateless session token (no server-side session storage needed). */
export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `admin.${expires}`;
  const sig = sign(payload);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

/** Verifies a session token's signature and expiry. */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(".");
    if (parts.length !== 3) return false;
    const [role, expiresStr, sig] = parts;
    if (role !== "admin") return false;
    const expected = sign(`${role}.${expiresStr}`);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
    return Date.now() < Number(expiresStr);
  } catch {
    return false;
  }
}
