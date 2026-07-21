import { isSafeHttpUrl } from './is-safe-http-url';
import { formatPartnerLinkLabel } from './format-partner-link-label';
import { type PartnerLinkEntry } from './partner-link-entry';

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
