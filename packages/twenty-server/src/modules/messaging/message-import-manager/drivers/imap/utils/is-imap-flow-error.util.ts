import { ImapFlowError } from 'src/modules/messaging/message-import-manager/drivers/imap/types/imap-error.type';

export const isImapFlowError = (error: Error): error is ImapFlowError => {
  return error !== undefined && error !== null;
};
