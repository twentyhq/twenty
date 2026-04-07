import { isSafeUrl } from './isSafeUrl';

export const getSafeUrl = (
  url: string | undefined | null,
): string | undefined => {
  if (!url || url.trim().length === 0) {
    return undefined;
  }

  if (isSafeUrl(url)) {
    return url;
  }

  const withScheme = `https://${url}`;

  return isSafeUrl(withScheme) ? withScheme : undefined;
};
