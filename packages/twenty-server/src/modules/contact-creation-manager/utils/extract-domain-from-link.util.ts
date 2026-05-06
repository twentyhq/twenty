import { ensureAbsoluteUrl, normalizeUrlOrigin } from 'twenty-shared/utils';

export const extractDomainFromLink = (link: string) => {
  if (!link) {
    return '';
  }

  const normalised = normalizeUrlOrigin(ensureAbsoluteUrl(link.trim()));

  return normalised
    .replace(/^(https?:\/\/)?(www\.)?/i, '')
    .split('/')[0]
    .toLowerCase();
};
