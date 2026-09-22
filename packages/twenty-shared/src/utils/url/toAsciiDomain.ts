const UNICODE_DOMAIN_DOT_REGEX = /[\u3002\uff0e\uff61]/g;
const TRAILING_DOMAIN_DOTS_REGEX = /\.+$/;
const INVALID_DOMAIN_URL_CHARACTERS_REGEX = /[/\\?#:@\s]/;

export const toAsciiDomain = (rawDomain: string): string => {
  const domain = rawDomain
    .trim()
    .replace(UNICODE_DOMAIN_DOT_REGEX, '.')
    .replace(TRAILING_DOMAIN_DOTS_REGEX, '')
    .toLowerCase();

  if (INVALID_DOMAIN_URL_CHARACTERS_REGEX.test(domain)) {
    return domain;
  }

  try {
    return new URL(`https://${domain}`).hostname.replace(
      TRAILING_DOMAIN_DOTS_REGEX,
      '',
    );
  } catch {
    return domain;
  }
};
