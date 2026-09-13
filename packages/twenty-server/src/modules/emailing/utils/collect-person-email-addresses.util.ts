import { isNonEmptyString } from '@sniptt/guards';

import { type EmailsMetadata } from 'twenty-shared/types';

import { normalizeEmailAddress } from 'src/modules/emailing/utils/normalize-email-address.util';

export const collectPersonEmailAddresses = (
  emails: EmailsMetadata | null | undefined,
): string[] => {
  const emailAddresses = [
    emails?.primaryEmail,
    ...(emails?.additionalEmails ?? []),
  ]
    .filter(isNonEmptyString)
    .map(normalizeEmailAddress);

  return [...new Set(emailAddresses)];
};
