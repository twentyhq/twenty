const UNICODE_DOMAIN_DOT_REGEX = /[\u3002\uff0e\uff61]/g;
const TRAILING_DOMAIN_DOTS_REGEX = /\.+$/;
const INVALID_DOMAIN_URL_CHARACTERS_REGEX = /[/\\?#:@\s]/;

export const canonicalizeEmail = (email: string): string => {
  const trimmedEmail = email.trim();
  const atIndex = trimmedEmail.lastIndexOf('@');

  if (atIndex === -1) {
    return trimmedEmail.toLowerCase();
  }

  const localPart = trimmedEmail.slice(0, atIndex).toLowerCase();
  const domain = trimmedEmail
    .slice(atIndex + 1)
    .replace(UNICODE_DOMAIN_DOT_REGEX, '.')
    .replace(TRAILING_DOMAIN_DOTS_REGEX, '')
    .toLowerCase();

  if (INVALID_DOMAIN_URL_CHARACTERS_REGEX.test(domain)) {
    return `${localPart}@${domain}`;
  }

  try {
    const asciiDomain = new URL(`https://${domain}`).hostname.replace(
      TRAILING_DOMAIN_DOTS_REGEX,
      '',
    );

    return `${localPart}@${asciiDomain}`;
  } catch {
    return `${localPart}@${domain}`;
  }
};
