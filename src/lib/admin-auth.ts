import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Access control for /admin.
 *
 * Deliberately minimal and dependency-free: one shared password from
 * `ADMIN_PASSWORD` (set it in Vercel env vars), exchanged for an HttpOnly,
 * signed, expiring session cookie. No user table, no OAuth app to configure,
 * nothing to leak — which is the right trade for one or two operators.
 *
 * Fails *closed*: with no ADMIN_PASSWORD configured, every admin route
 * redirects to a setup page instead of rendering data.
 */

const COOKIE = "ledgr_admin";
const SESSION_DAYS = 7;

export function adminUser(): string {
  return process.env.ADMIN_USER?.trim() || "admin";
}

/** True once a password has been set. Until then, /admin stays locked. */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD?.trim());
}

/**
 * Signing key. ADMIN_SECRET is preferred (so rotating the password doesn't
 * silently keep old sessions alive); otherwise the password doubles as it.
 */
function secret(): string {
  return process.env.ADMIN_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim() || "";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function createToken(now = Date.now()): string {
  const expires = now + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${adminUser()}:${expires}`;
  return `${payload}:${sign(payload)}`;
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token || !secret()) return false;
  const parts = token.split(":");
  if (parts.length !== 3) return false;
  const [user, expiresRaw, signature] = parts as [string, string, string];
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  if (user !== adminUser()) return false;
  return safeEqual(signature, sign(`${user}:${expiresRaw}`));
}

/** Username + password check for the login action. */
export function checkCredentials(user: string, password: string): boolean {
  if (!adminConfigured()) return false;
  const expectedUser = adminUser();
  const expectedPassword = process.env.ADMIN_PASSWORD!.trim();
  // Compare both, always, so a wrong username and a wrong password cost the
  // same time.
  const userOk = safeEqual(user.trim(), expectedUser);
  const passOk = safeEqual(password, expectedPassword);
  return userOk && passOk;
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const store = await cookies();
  return verifyToken(store.get(COOKIE)?.value);
}

/** Guard for every admin page. Redirects rather than rendering anything. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, createToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
