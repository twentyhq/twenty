// Derives a stable rate-limit key from the proxy headers a Next deployment
// sets in front of the route. Falls back to 'unknown' so a missing header
// degrades to a single shared bucket rather than throwing.
export function getClientIpKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}
