export const normalizeAllowedIframeOrigin = (
  value: string,
): string | undefined => {
  if (value.length > 300 || /[\s*\\]/.test(value)) {
    return undefined;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== 'https:' ||
      !/^https:\/\/[^/?#@]+\/?$/i.test(value) ||
      !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i.test(
        url.hostname,
      ) ||
      url.username !== '' ||
      url.password !== '' ||
      url.pathname !== '/' ||
      url.search !== '' ||
      url.hash !== ''
    ) {
      return undefined;
    }

    return url.origin;
  } catch {
    return undefined;
  }
};
