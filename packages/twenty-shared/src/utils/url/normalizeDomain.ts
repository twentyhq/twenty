import { toAsciiDomain } from '@/utils/url/toAsciiDomain';

const SCHEME_PREFIX_REGEX = /^[a-z][a-z0-9+.-]*:\/\//i;
const PATH_SEPARATOR_REGEX = /[/\\?#]/;
const USER_INFO_PREFIX_REGEX = /^.*@/;
const PORT_SUFFIX_REGEX = /:\d+$/;

const stripWwwPrefixes = (host: string): string => {
  const labels = host.split('.');

  while (labels[0] === 'www') {
    labels.shift();
  }

  return labels.join('.');
};

export const normalizeDomain = (rawDomain: string): string => {
  const host = rawDomain
    .trim()
    .replace(SCHEME_PREFIX_REGEX, '')
    .split(PATH_SEPARATOR_REGEX)[0]
    .replace(USER_INFO_PREFIX_REGEX, '')
    .replace(PORT_SUFFIX_REGEX, '');

  return stripWwwPrefixes(toAsciiDomain(host));
};
