const UNSAFE_DOMAIN_CHARACTERS = /[\s/\\?#@:[\]]/;

const canonicalizeEmailDomain = (domain: string): string => {
  const normalizedDomain = domain.normalize('NFKC').toLowerCase();

  if (UNSAFE_DOMAIN_CHARACTERS.test(normalizedDomain)) {
    return normalizedDomain;
  }

  try {
    return new URL(`https://${normalizedDomain}`).hostname.replace(/\.+$/, '');
  } catch {
    return normalizedDomain;
  }
};

// Email values have historically been lowercased by Twenty. Keep that product
// behavior while also giving internationalized domains one stable IDNA form.
// URL is used instead of node:url so this shared utility works in the browser.
export const canonicalizeEmail = (email: string): string => {
  const atIndex = email.lastIndexOf('@');

  if (atIndex <= 0 || atIndex === email.length - 1) {
    return email.toLowerCase();
  }

  const localPart = email.slice(0, atIndex).toLowerCase();
  const domain = canonicalizeEmailDomain(email.slice(atIndex + 1));

  return `${localPart}@${domain}`;
};

// Keep the pre-IDNA lowercase spelling as a read candidate so a rollout does
// not make existing Unicode-domain records unreachable before data migration.
export const getEmailMatchCandidates = (email: string): string[] => [
  ...new Set([email.toLowerCase(), canonicalizeEmail(email)]),
];
