import { type GmailFoldersError } from 'src/modules/messaging/message-folder-manager/drivers/gmail/types/gmail-folders-error.type';

export const isGmailFoldersError = (
  error: unknown,
): error is GmailFoldersError => {
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
