/**
 * Best-effort client IP from reverse-proxy headers, then the request URL host.
 * Never throws — returns null when nothing usable is found.
 */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  for (const header of ["x-real-ip", "cf-connecting-ip", "true-client-ip"] as const) {
    const value = request.headers.get(header)?.trim();
    if (value) return value;
  }

  return null;
}
