import { NextRequest, NextResponse } from "next/server";
import { isAdminHost } from "@/lib/hostGate";

// Builds a strict Content-Security-Policy. Scripts are locked to our own
// origin plus a fresh per-request nonce (Next.js automatically applies the
// same nonce to its own internal hydration scripts once it sees this header
// — no 'unsafe-inline' needed for script-src at all). Inline `style`
// attributes are still allowed because Framer Motion and a lot of ordinary
// React code (opacity/width toggles, drag styles, carousel transforms) rely
// on them directly; style-src is far lower-risk than script-src to relax.
function buildCsp(nonce: string, isAdminRoute: boolean): string {
  return [
    "default-src 'self'",
    // Next.js dev mode uses eval() for source maps/HMR; production never does.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${isAdminRoute ? "'none'" : "'self'"}`,
    "upgrade-insecure-requests"
  ].join("; ");
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host");
  const { pathname } = req.nextUrl;
  const onAdminHost = isAdminHost(host);

  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isApiPath = pathname.startsWith("/api/");
  const isUploadAsset = pathname.startsWith("/uploads/");
  const isMutatingDataCall = pathname === "/api/data" && req.method !== "GET";
  const isAuthCall = pathname.startsWith("/api/auth");
  const isUploadCall = pathname.startsWith("/api/upload");

  // Uploaded files are served by app/uploads/[name]/route.ts, which sets its own
  // locked-down headers — nothing to add here on either hostname.
  if (isUploadAsset) return NextResponse.next();

  // Public/main domain: the admin UI and any account-mutating API calls
  // simply do not exist here — return a plain 404 rather than a redirect,
  // so the panel's presence isn't hinted at. No nonce/CSP needed for these.
  if (!onAdminHost && (isAdminPath || isMutatingDataCall || isAuthCall || isUploadCall)) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Every HTML-rendering response gets a fresh nonce, forwarded both to the
  // page (so app/layout.tsx can put it on our one inline script) and to the
  // CSP header itself.
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce, onAdminHost || isAdminPath);
  const forwardedHeaders = new Headers(req.headers);
  forwardedHeaders.set("x-nonce", nonce);
  // Next.js reads the nonce for its own hydration scripts from the CSP on the
  // *request*, so it has to be forwarded there too, not just set on the response.
  forwardedHeaders.set("Content-Security-Policy", csp);

  function passThrough() {
    const res = NextResponse.next({ request: { headers: forwardedHeaders } });
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  function rewriteToAdmin() {
    const res = NextResponse.rewrite(new URL("/admin", req.url), { request: { headers: forwardedHeaders } });
    res.headers.set("Content-Security-Policy", csp);
    return res;
  }

  if (onAdminHost) {
    // The admin subdomain only ever shows the admin app. Everything else
    // (including the marketing homepage) is rewritten to it, so there is
    // no public content reachable there at all — except uploaded images,
    // which the admin dashboard itself needs to preview.
    if (isApiPath || isUploadAsset) return passThrough();
    if (!isAdminPath) return rewriteToAdmin();
    return passThrough();
  }

  return passThrough();
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico).*)"]
};
