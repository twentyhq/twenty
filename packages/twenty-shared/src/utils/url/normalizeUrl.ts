import { ensureAbsoluteUrl } from '@/utils/url/ensureAbsoluteUrl';
import { normalizeUrlOrigin } from '@/utils/url/normalizeUrlOrigin';

export const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();

  if (trimmed === '') {
    return trimmed;
  }

  return normalizeUrlOrigin(ensureAbsoluteUrl(trimmed));
};
