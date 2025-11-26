import { type GmailMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-messages-import-error.type';

export const isGmailMessagesImportError = (
  error: unknown,
): error is GmailMessagesImportError => {
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
