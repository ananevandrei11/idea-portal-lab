import type { NextRequest } from "next/server";

/**
 * Number of proxies between the client and this app that append to
 * `x-forwarded-for`. On Vercel that is 1 (the platform edge). Behind an extra
 * load balancer or CDN, raise it to match — every hop adds one entry.
 *
 * Defaults to 0: with no declared proxy in front, every entry in the header was
 * written by the caller and none of it can be trusted.
 */
const TRUSTED_PROXY_COUNT = Number(process.env.TRUSTED_PROXY_COUNT ?? "0");

/**
 * Resolves the client IP for rate limiting.
 *
 * `x-forwarded-for` is a client-appendable list: the leftmost entry is whatever
 * the caller sent, so trusting it lets anyone mint a fresh limiter bucket per
 * request. Only the rightmost entries are written by infrastructure we control,
 * so we count in from the right by the number of proxies in front of us.
 *
 * Returns null when no trustworthy address can be derived — the caller decides
 * what to do rather than having every unidentified client collapse into one
 * shared bucket.
 */
export function getClientIp(request: NextRequest): string | null {
  // Set by Vercel from the real connection; not forgeable by the client.
  const platformIp = request.headers.get("x-vercel-forwarded-for");
  if (platformIp) return platformIp.trim();

  // With no proxy declared, every forwarding header is caller-supplied and
  // forgeable, so none of them may be used as a limiter key.
  if (TRUSTED_PROXY_COUNT < 1) return null;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    // Our own proxies appended the last TRUSTED_PROXY_COUNT entries, so the one
    // immediately before them is the address they actually observed. A shorter
    // chain than that means the request did not pass through them.
    const index = hops.length - TRUSTED_PROXY_COUNT;
    if (index >= 0 && hops[index]) return hops[index];
    return null;
  }

  // Written by a single reverse proxy (nginx and friends); only meaningful when
  // one is declared to sit in front.
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return null;
}
