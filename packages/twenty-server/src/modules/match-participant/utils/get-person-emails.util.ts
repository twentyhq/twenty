import { isNonEmptyString } from '@sniptt/guards';
import { type EmailsMetadata } from 'twenty-shared/types';

export const getPersonEmails = (emails: EmailsMetadata | undefined): string[] =>
  [emails?.primaryEmail, ...(emails?.additionalEmails ?? [])].filter(
    isNonEmptyString,
  );
