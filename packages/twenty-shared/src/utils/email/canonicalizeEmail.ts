import { toAsciiDomain } from '@/utils/url/toAsciiDomain';

export const canonicalizeEmail = (email: string): string => {
  const trimmedEmail = email.trim();
  const atIndex = trimmedEmail.lastIndexOf('@');

  if (atIndex === -1) {
    return trimmedEmail.toLowerCase();
  }

  const localPart = trimmedEmail.slice(0, atIndex).toLowerCase();
  const domain = toAsciiDomain(trimmedEmail.slice(atIndex + 1));

  return `${localPart}@${domain}`;
};
