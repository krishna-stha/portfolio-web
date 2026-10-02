import { NextRequest, NextResponse } from "next/server";
import { getSiteData, saveSiteData } from "@/lib/dataStore";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { isAdminHost } from "@/lib/hostGate";
import { rateLimit } from "@/lib/rateLimit";

// Always read fresh from disk — never prerender this at build time.
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2MB — content is text only; files are uploaded separately.

// GET /api/data — public. The homepage and the admin dashboard both read
// the current content through this same REST endpoint.
export async function GET() {
  const data = getSiteData();
  return NextResponse.json(data);
}

// PUT /api/data — admin subdomain + valid session only. Overwrites the
// entire content document (the admin dashboard always sends the full,
// already-merged object back).
export async function PUT(req: NextRequest) {
  if (!isAdminHost(req.headers.get("host"))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limit = rateLimit(req, "data-write", 60, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid content shape" }, { status: 400 });
    }
    saveSiteData(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
