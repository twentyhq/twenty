const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

const SAME_ORIGIN_PROBE_BASE_URL = 'https://same-origin-probe.invalid';

export const isSafeUrl = (url: string | null | undefined): boolean => {
  if (typeof url !== 'string' || url.length === 0) {
    return false;
  }

  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return false;
  }

  if (trimmed.startsWith('/')) {
    try {
      return (
        new URL(trimmed, SAME_ORIGIN_PROBE_BASE_URL).origin ===
        SAME_ORIGIN_PROBE_BASE_URL
      );
    } catch {
      return false;
    }
  }

  try {
    const parsed = new URL(trimmed);

    return SAFE_URL_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
};
