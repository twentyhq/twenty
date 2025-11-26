import { type GmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-api-error.type';

export const isGmailApiError = (error: unknown): error is GmailApiError => {
  if (error === null || typeof error !== 'object') {
    return false;
  }

  if (
    !('code' in error) ||
    typeof error.code !== 'string' ||
    !('message' in error) ||
    typeof error.message !== 'string'
  ) {
    return false;
  }

  return true;
};
