const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

const SAME_ORIGIN_PROBE_BASE_URL = 'https://same-origin-probe.invalid';

export const isSafeUrl = (url: string): boolean => {
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
