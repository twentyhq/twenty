import { isSafeHttpUrl } from './is-safe-http-url';
import { type PartnerLinks } from './marketplace-partner';

export type PartnerLinkEntry = {
  href: string;
  label: string;
};

const LINK_ORDER: readonly (keyof PartnerLinks)[] = [
  'website',
  'linkedin',
  'x',
  'github',
];

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

export function collectPartnerLinks(
  links: PartnerLinks,
): readonly PartnerLinkEntry[] {
  const seen = new Set<string>();

  return LINK_ORDER.flatMap((key) => {
    const raw = links[key];
    if (raw === null || !isSafeHttpUrl(raw)) {
      return [];
    }

    const href = raw.includes('://') ? raw : `https://${raw}`;
    if (seen.has(href)) {
      return [];
    }

    seen.add(href);
    return [{ href, label: formatPartnerLinkLabel(href) }];
  });
}

export function collectPartnerLinkUrls(
  urls: readonly string[],
): readonly PartnerLinkEntry[] {
  const seen = new Set<string>();

  return urls.flatMap((raw) => {
    if (!isSafeHttpUrl(raw)) {
      return [];
    }

    const href = raw.includes('://') ? raw : `https://${raw}`;
    if (seen.has(href)) {
      return [];
    }

    seen.add(href);
    return [{ href, label: formatPartnerLinkLabel(href) }];
  });
}
