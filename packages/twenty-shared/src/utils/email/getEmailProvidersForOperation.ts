import { EMAIL_DRAFTING_PROVIDERS, EMAIL_SENDING_PROVIDERS } from '@/constants';
import { type ConnectedAccountProvider, EmailOperation } from '@/types';
import { assertUnreachable } from '@/utils/assertUnreachable';

export const getEmailProvidersForOperation = (
  operation: EmailOperation,
): ConnectedAccountProvider[] => {
  switch (operation) {
    case EmailOperation.SEND:
      return EMAIL_SENDING_PROVIDERS;
    case EmailOperation.DRAFT:
      return EMAIL_DRAFTING_PROVIDERS;
    default:
      return assertUnreachable(
        operation,
        `Unhandled email operation: ${operation}`,
      );
  }
};
