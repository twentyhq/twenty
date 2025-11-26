import { type GmailMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message-list-fetch-error.type';

export const isGmailMessageListFetchError = (
  error: unknown,
): error is GmailMessageListFetchError => {
  if (error === null || typeof error !== 'object') {
    return false;
  }

  if (
    !('code' in error) ||
    !('errors' in error) ||
    !Array.isArray(error.errors) ||
    error.errors.length === 0 ||
    error.errors.some((error) => !('reason' in error) || !('message' in error))
  ) {
    return false;
  }

  return true;
};
