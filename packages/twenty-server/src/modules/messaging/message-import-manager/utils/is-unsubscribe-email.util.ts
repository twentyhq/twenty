import { isNonEmptyString } from '@sniptt/guards';
import psl from 'psl';

import { isParsedDomain } from 'src/modules/contact-creation-manager/types/is-psl-parsed-domain.type';
import { UNSUBSCRIBE_KEYWORD_PATTERN } from 'src/modules/messaging/message-import-manager/constants/unsubscribe-keyword-pattern.constant';

export const isUnsubscribeEmail = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase();
  const atIndex = normalizedEmail.lastIndexOf('@');
  const localPart =
    atIndex === -1 ? normalizedEmail : normalizedEmail.slice(0, atIndex);

  if (UNSUBSCRIBE_KEYWORD_PATTERN.test(localPart)) {
    return true;
  }

  if (atIndex === -1) {
    return false;
  }

  const parsedDomain = psl.parse(normalizedEmail.slice(atIndex + 1));

  if (!isParsedDomain(parsedDomain)) {
    return false;
  }

  // dedicated subdomains like unsubscribe2.customer.io count, registrable
  // domains like unsubscribe-tools.com or unsubscribe.co.uk do not
  const subdomain = parsedDomain.subdomain;

  return (
    isNonEmptyString(subdomain) &&
    subdomain
      .split('.')
      .some((label) => UNSUBSCRIBE_KEYWORD_PATTERN.test(label))
  );
};
