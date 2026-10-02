import { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

// In-memory and per-instance: fine for a single Node server or VPS. On a
// multi-instance/serverless deployment this state isn't shared across
// instances, so it becomes a soft per-instance limit rather than a hard
// global one — see README → Security for the tradeoff and how to upgrade
// to a shared store (e.g. Redis) if you need it.
const buckets = new Map<string, Bucket>();

// Periodically forget old buckets so this map can't grow unbounded.
const MAX_BUCKETS = 5000;

function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown";
  return ip;
}

/**
 * Fixed-window rate limit. Returns whether the request is allowed, plus how
 * many seconds until the caller may retry if it isn't.
 */
export function rateLimit(
  req: NextRequest,
  scope: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const key = `${scope}:${clientKey(req)}`;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size > MAX_BUCKETS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
