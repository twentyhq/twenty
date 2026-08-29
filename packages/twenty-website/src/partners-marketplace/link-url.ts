import { type LinkValue } from './marketplace-api-types';
import { normalizeUrl } from './normalize-url';

export const linkUrl = (link: LinkValue): string =>
  normalizeUrl(link?.primaryLinkUrl ?? '');
