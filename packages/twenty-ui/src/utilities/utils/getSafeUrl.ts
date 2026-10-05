const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

const SAME_ORIGIN_PROBE_BASE_URL = 'https://same-origin-probe.invalid';

const isSafeUrl = (url: string): boolean => {
  if (url.startsWith('/')) {
    try {
      return (
        new URL(url, SAME_ORIGIN_PROBE_BASE_URL).origin ===
        SAME_ORIGIN_PROBE_BASE_URL
      );
    } catch {
      return false;
    }
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

  if (url.startsWith('/')) {
    return undefined;
  }

  const withScheme = `https://${url}`;

  return isSafeUrl(withScheme) ? withScheme : undefined;
};
