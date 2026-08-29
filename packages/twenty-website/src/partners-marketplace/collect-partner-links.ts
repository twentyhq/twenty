import { isSafeHttpUrl } from './is-safe-http-url';
import { type PartnerLinks } from './marketplace-partner';
import { formatPartnerLinkLabel } from './format-partner-link-label';
import { type PartnerLinkEntry } from './partner-link-entry';

const LINK_ORDER: readonly (keyof PartnerLinks)[] = [
  'website',
  'linkedin',
  'x',
  'github',
];

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
