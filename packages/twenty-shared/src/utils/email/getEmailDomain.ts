import { isNonEmptyString } from '@sniptt/guards';

export const getEmailDomain = (emailAddress: string): string | null => {
  const domain = emailAddress
    .slice(emailAddress.lastIndexOf('@') + 1)
    .toLowerCase();

  return emailAddress.includes('@') && isNonEmptyString(domain) ? domain : null;
};
