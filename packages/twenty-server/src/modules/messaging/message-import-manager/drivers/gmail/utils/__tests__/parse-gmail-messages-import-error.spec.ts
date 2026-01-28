import { MessageImportDriverExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { getGmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/mocks/gmail-api-error-mocks';
import { GmailMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-messages-import-error-handler.service';

const messageExternalId = '123';

describe('GmailMessagesImportErrorHandler', () => {
  let handler: GmailMessagesImportErrorHandler;

  beforeEach(() => {
    handler = new GmailMessagesImportErrorHandler();
  });

  it('should handle 400 Bad Request', () => {
    const error = getGmailApiError({ code: 400 });

    expect(() => handler.handleError(error, messageExternalId)).toThrow(
      expect.objectContaining({
        code: MessageImportDriverExceptionCode.UNKNOWN,
      }),
    );
  });

  it('should handle 400 Invalid Grant', () => {
    const error = getGmailApiError({ code: 400, reason: 'invalid_grant' });

    expect(() => handler.handleError(error, messageExternalId)).toThrow(
      expect.objectContaining({
        code: MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      }),
    );
  });

  it('should handle 400 Failed Precondition', () => {
    const error = getGmailApiError({ code: 400, reason: 'failedPrecondition' });

    expect(() => handler.handleError(error, messageExternalId)).toThrow(
      expect.objectContaining({
        code: MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      }),
    );
  });

  it('should handle 401 Invalid Credentials', () => {
    const error = getGmailApiError({ code: 401 });

    expect(() => handler.handleError(error, messageExternalId)).toThrow(
      expect.objectContaining({
        code: MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      }),
    );
  });

  it('should handle 403 Daily Limit Exceeded', () => {
    const error = getGmailApiError({ code: 403, reason: 'dailyLimit' });

    expect(() => handler.handleError(error, messageExternalId)).toThrow(
      expect.objectContaining({
        code: MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      }),
    );
  });

  it('should handle 403 User Rate Limit Exceeded', () => {
    const error = getGmailApiError({ code: 403, reason: 'userRateLimit' });

    expect(() => handler.handleError(error, messageExternalId)).toThrow(
      expect.objectContaining({
        code: MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      }),
    );
  });

  it('should handle 403 Rate Limit Exceeded', () => {
    const error = getGmailApiError({ code: 403, reason: 'rateLimit' });

    expect(() => handler.handleError(error, messageExternalId)).toThrow(
      expect.objectContaining({
        code: MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      }),
    );
  });

  it('should handle 403 Domain Policy Error', () => {
    const error = getGmailApiError({ code: 403, reason: 'domainPolicy' });

    expect(() => handler.handleError(error, messageExternalId)).toThrow(
      expect.objectContaining({
        code: MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      }),
    );
  });

  it('should handle 404 Not Found by returning silently', () => {
    const error = getGmailApiError({ code: 404 });

    expect(() => handler.handleError(error, messageExternalId)).not.toThrow();
  });

  it('should handle 410 Gone by returning silently', () => {
    const error = getGmailApiError({ code: 410 });

    expect(() => handler.handleError(error, messageExternalId)).not.toThrow();
  });

  it('should handle 429 Too Many Requests', () => {
    const error = getGmailApiError({ code: 429 });

    expect(() => handler.handleError(error, messageExternalId)).toThrow(
      expect.objectContaining({
        code: MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      }),
    );
  });

  it('should handle 500 Backend Error', () => {
    const error = getGmailApiError({ code: 500 });

    expect(() => handler.handleError(error, messageExternalId)).toThrow(
      expect.objectContaining({
        code: MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      }),
    );
  });
});
