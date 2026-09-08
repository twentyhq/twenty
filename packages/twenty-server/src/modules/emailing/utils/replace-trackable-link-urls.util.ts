import { isDefined } from 'twenty-shared/utils';

import { TRACKABLE_HREF_PATTERN } from 'src/modules/emailing/constants/trackable-href-pattern.constant';
import { decodeHtmlAttributeUrl } from 'src/modules/emailing/utils/decode-html-attribute-url.util';

export const replaceTrackableLinkUrls = (
  html: string,
  trackedUrlByUrl: Map<string, string>,
): string =>
  html.replaceAll(TRACKABLE_HREF_PATTERN, (href, quote, rawUrl) => {
    const trackedUrl = trackedUrlByUrl.get(decodeHtmlAttributeUrl(rawUrl));

    return isDefined(trackedUrl) ? `href=${quote}${trackedUrl}${quote}` : href;
  });
