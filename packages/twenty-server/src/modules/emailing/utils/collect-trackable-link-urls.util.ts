import {
  TRACKABLE_HREF_PATTERN,
  TRACKABLE_URL_PATTERN,
  UNRESOLVED_TEMPLATE_TAG_PATTERN,
} from 'src/modules/emailing/constants/trackable-href-pattern.constant';
import { decodeHtmlAttributeUrl } from 'src/modules/emailing/utils/decode-html-attribute-url.util';

export const collectTrackableLinkUrls = (html: string): string[] => {
  const urls = new Set<string>();

  for (const [, , rawUrl] of html.matchAll(TRACKABLE_HREF_PATTERN)) {
    const url = decodeHtmlAttributeUrl(rawUrl);

    if (
      TRACKABLE_URL_PATTERN.test(url) &&
      !UNRESOLVED_TEMPLATE_TAG_PATTERN.test(url)
    ) {
      urls.add(url);
    }
  }

  return [...urls];
};
