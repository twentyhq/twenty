const SCHEME_PREFIX_REGEX = /^[a-z][a-z0-9+.-]*:\/\//i;
const PATH_SEPARATOR_REGEX = /[/?#]/;
const USER_INFO_PREFIX_REGEX = /^.*@/;
const PORT_SUFFIX_REGEX = /:\d+$/;
const TRAILING_DOT_REGEX = /\.+$/;
const WWW_PREFIX_REGEX = /^(www\.)+/;

export const normalizeDomain = (rawDomain: string): string => {
  const host = rawDomain
    .trim()
    .replace(SCHEME_PREFIX_REGEX, '')
    .split(PATH_SEPARATOR_REGEX)[0]
    .replace(USER_INFO_PREFIX_REGEX, '')
    .replace(PORT_SUFFIX_REGEX, '')
    .replace(TRAILING_DOT_REGEX, '')
    .toLowerCase()
    .replace(WWW_PREFIX_REGEX, '');

  try {
    return new URL(`https://${host}`).hostname;
  } catch {
    return host;
  }
};
