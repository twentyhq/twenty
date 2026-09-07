const SCHEME_PREFIX_REGEX = /^[a-z][a-z0-9+.-]*:\/\//i;
const PATH_SEPARATOR_REGEX = /[/\\?#]/;
const USER_INFO_PREFIX_REGEX = /^.*@/;
const PORT_SUFFIX_REGEX = /:\d+$/;

const stripWwwPrefixesAndTrailingDots = (host: string): string => {
  const labels = host.split('.');

  while (labels.length > 0 && labels[labels.length - 1] === '') {
    labels.pop();
  }

  while (labels[0] === 'www') {
    labels.shift();
  }

  return labels.join('.');
};

const toPunycodeHost = (host: string): string => {
  try {
    return new URL(`https://${host}`).hostname;
  } catch {
    return host;
  }
};

export const normalizeDomain = (rawDomain: string): string => {
  const host = stripWwwPrefixesAndTrailingDots(
    rawDomain
      .trim()
      .replace(SCHEME_PREFIX_REGEX, '')
      .split(PATH_SEPARATOR_REGEX)[0]
      .replace(USER_INFO_PREFIX_REGEX, '')
      .replace(PORT_SUFFIX_REGEX, '')
      .toLowerCase(),
  );

  return toPunycodeHost(host);
};
