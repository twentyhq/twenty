const UNICODE_DOMAIN_DOT_REGEX = /[\u3002\uff0e\uff61]/g;
const INVALID_DOMAIN_URL_CHARACTERS_REGEX = /[/\\?#:@\s]/;

const stripTrailingDots = (domain: string): string => {
  let end = domain.length;

  while (end > 0 && domain[end - 1] === '.') {
    end--;
  }

  return domain.slice(0, end);
};

export const toAsciiDomain = (rawDomain: string): string => {
  const domain = stripTrailingDots(
    rawDomain.trim().replace(UNICODE_DOMAIN_DOT_REGEX, '.').toLowerCase(),
  );

  if (INVALID_DOMAIN_URL_CHARACTERS_REGEX.test(domain)) {
    return domain;
  }

  try {
    return stripTrailingDots(new URL(`https://${domain}`).hostname);
  } catch {
    return domain;
  }
};
