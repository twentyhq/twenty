import { type GmailApiBatchError } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-api-batch-error.type';

export const isGmailApiBatchError = (
  error: unknown,
): error is GmailApiBatchError => {
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
