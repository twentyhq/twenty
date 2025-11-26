import { type GoogleEmailAliasError } from 'src/modules/connected-account/email-alias-manager/drivers/google/types/google-email-alias-error.type';

export const isGmailEmailAliasError = (
  error: unknown,
): error is GoogleEmailAliasError => {
  if (error === null || typeof error !== 'object') {
    return false;
  }

  if (!('code' in error)) {
    return false;
  }

  return true;
};
