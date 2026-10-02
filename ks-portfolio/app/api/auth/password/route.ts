import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, setPassword, SESSION_COOKIE_NAME } from "@/lib/auth";
import { isAdminHost } from "@/lib/hostGate";
import { rateLimit } from "@/lib/rateLimit";

// PATCH /api/auth/password — change the admin password with { newPassword }.
export async function PATCH(req: NextRequest) {
  if (!isAdminHost(req.headers.get("host"))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limit = rateLimit(req, "password-change", 10, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }
  let newPassword: unknown;
  try {
    ({ newPassword } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  setPassword(newPassword);
  return NextResponse.json({ ok: true });
}
