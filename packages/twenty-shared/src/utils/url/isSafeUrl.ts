const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

const RELATIVE_URL_BASE = 'https://relative-url.invalid';

export const isSafeUrl = (url: string): boolean => {
  if (url.startsWith('/')) {
    // Browsers resolve "//host" and "/\host" as scheme-relative URLs, so
    // rely on the URL parser to tell same-origin paths from those.
    try {
      return new URL(url, RELATIVE_URL_BASE).origin === RELATIVE_URL_BASE;
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
