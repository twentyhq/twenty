const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

export const isSafeUrl = (url: string): boolean => {
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
