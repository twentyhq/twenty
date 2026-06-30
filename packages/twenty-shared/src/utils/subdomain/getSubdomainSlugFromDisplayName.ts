import { slugify } from 'transliteration';

import { isDefined } from '@/utils/validation/isDefined';

const SUBDOMAIN_MIN_LENGTH = 3;
const SUBDOMAIN_MAX_LENGTH = 30;

export const getSubdomainSlugFromDisplayName = (
  displayName?: string,
): string | undefined => {
  if (!isDefined(displayName)) {
    return undefined;
  }

  const slug = slugify(displayName, {
    trim: true,
    separator: '-',
    allowedChars: 'a-zA-Z0-9',
  })
    .slice(0, SUBDOMAIN_MAX_LENGTH)
    .replace(/-+$/g, '');

  return slug.length >= SUBDOMAIN_MIN_LENGTH ? slug : undefined;
};
