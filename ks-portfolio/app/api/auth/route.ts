import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSessionToken, verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { isAdminHost } from "@/lib/hostGate";
import { rateLimit } from "@/lib/rateLimit";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7
};

// GET /api/auth — is the current visitor logged in?
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return NextResponse.json({ authenticated: verifySessionToken(token) });
}

// POST /api/auth — log in with { password }. Rate-limited per IP so the
// password can't be brute-forced: 8 attempts per 10 minutes.
export async function POST(req: NextRequest) {
  if (!isAdminHost(req.headers.get("host"))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const limit = rateLimit(req, "login", 8, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (typeof password !== "string" || !verifyPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, createSessionToken(), COOKIE_OPTS);
  return res;
}

// DELETE /api/auth — log out.
export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", { ...COOKIE_OPTS, maxAge: 0 });
  return res;
}
