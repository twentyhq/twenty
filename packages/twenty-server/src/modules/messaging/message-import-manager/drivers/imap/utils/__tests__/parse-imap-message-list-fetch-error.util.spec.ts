import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { parseImapMessageListFetchError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-imap-message-list-fetch-error.util';

const createImapFlowError = (
  properties: Record<string, string>,
  message = 'Command failed',
): Error => Object.assign(new Error(message), properties);

describe('parseImapMessageListFetchError', () => {
  describe('missing mailbox classification', () => {
    it('should classify a Fastmail "Mailbox does not exist" SELECT rejection as NOT_FOUND', () => {
      const error = createImapFlowError({
        response: 'NO Mailbox does not exist',
        responseStatus: 'NO',
        responseText: 'Mailbox does not exist',
        executedCommand: 'SELECT "Parent/Subfolder/Anémo+"',
      });

      const result = parseImapMessageListFetchError(error);

      expect(result.code).toBe(MessageImportDriverExceptionCode.NOT_FOUND);
    });

    it('should classify a NONEXISTENT server response code as NOT_FOUND', () => {
      const error = createImapFlowError({
        serverResponseCode: 'NONEXISTENT',
        responseText: 'Unknown Mailbox: Ghost (Failure)',
        responseStatus: 'NO',
      });

      const result = parseImapMessageListFetchError(error);

      expect(result.code).toBe(MessageImportDriverExceptionCode.NOT_FOUND);
    });

    it('should classify a Dovecot "Mailbox doesn\'t exist" rejection as NOT_FOUND', () => {
      const error = createImapFlowError({
        responseText: "Mailbox doesn't exist: Ghost",
        responseStatus: 'NO',
      });

      const result = parseImapMessageListFetchError(error);

      expect(result.code).toBe(MessageImportDriverExceptionCode.NOT_FOUND);
    });

    it('should keep other server rejections classified as UNKNOWN', () => {
      const error = createImapFlowError({
        responseText: 'Server busy, try again later',
        responseStatus: 'NO',
      });

      const result = parseImapMessageListFetchError(error);

      expect(result.code).toBe(MessageImportDriverExceptionCode.UNKNOWN);
    });
  });

  describe('already-classified exceptions', () => {
    it('should return an already-parsed exception unchanged instead of re-wrapping it as UNKNOWN', () => {
      const alreadyParsed = new MessageImportDriverException(
        'IMAP sync cursor error: Invalid search',
        MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
      );

      const result = parseImapMessageListFetchError(alreadyParsed);

      expect(result).toBe(alreadyParsed);
      expect(result.code).toBe(
        MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
      );
    });
  });
});
