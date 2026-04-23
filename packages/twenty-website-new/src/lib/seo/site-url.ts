/**
 * Single source of truth for the site's canonical origin.
 *
 * Used by metadata, sitemap, robots, and any helper that needs absolute URLs
 * (Open Graph image, Twitter card, JSON-LD). Trailing slashes are stripped
 * so callers can always concatenate a leading-slash path.
 *
 * The default fallback is `https://twenty.com` so dev/preview builds keep
 * working without configuration; in production we expect
 * `NEXT_PUBLIC_WEBSITE_URL` to be set explicitly. We never silently swallow
 * an empty string — `??` only fires on `undefined`.
 */

const DEFAULT_SITE_URL = 'https://twenty.com';

function normalize(url: string): string {
  return url.replace(/\/+$/, '');
}

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_WEBSITE_URL;

  if (typeof configured === 'string' && configured.trim().length > 0) {
    return normalize(configured.trim());
  }

  return DEFAULT_SITE_URL;
}

export function getAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${getSiteUrl()}${path}`;
}
