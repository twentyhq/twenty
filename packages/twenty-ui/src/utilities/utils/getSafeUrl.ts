const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

const isSafeUrl = (url: string): boolean => {
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }

  try {
    const parsed = new URL(url);

    return SAFE_URL_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
};

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
