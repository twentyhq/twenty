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
