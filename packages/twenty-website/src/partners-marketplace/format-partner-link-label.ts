/** Human-readable label from a URL — usually the hostname, path included when useful. */
export function formatPartnerLinkLabel(url: string): string {
  try {
    const parsed = new URL(url.includes('://') ? url : `https://${url}`);
    const host = parsed.hostname.replace(/^www\./i, '');
    const path =
      parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/$/, '');
    const label = path ? `${host}${path}` : host;

    return label.length > 52 ? `${label.slice(0, 49)}…` : label;
  } catch {
    return url;
  }
}
