import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import gmailApiErrorMocks from 'src/modules/messaging/message-import-manager/drivers/gmail/mocks/gmail-api-error-mocks';
import { parseGmailMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-messages-import-error.util';

const messageExternalId = '123';

describe('parseGmailMessagesImportError', () => {
  it('should handle 400 Bad Request', () => {
    const error = gmailApiErrorMocks.getError(400);
    const exception = parseGmailMessagesImportError(
      error.error,
      messageExternalId,
    );

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(MessageImportDriverExceptionCode.UNKNOWN);
    expect(exception?.message).toBe(
      `${error.error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 400 Invalid Grant', () => {
    const error = gmailApiErrorMocks.getError(400, 'invalid_grant');
    const exception = parseGmailMessagesImportError(
      error.error,
      messageExternalId,
    );

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
    expect(exception?.message).toBe(
      `${error.error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 400 Failed Precondition', () => {
    const error = gmailApiErrorMocks.getError(400, 'failedPrecondition');
    const exception = parseGmailMessagesImportError(
      error.error,
      messageExternalId,
    );

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 401 Invalid Credentials', () => {
    const error = gmailApiErrorMocks.getError(401);
    const exception = parseGmailMessagesImportError(
      error.error,
      messageExternalId,
    );

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
    expect(exception?.message).toBe(
      `${error.error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 403 Daily Limit Exceeded', () => {
    const error = gmailApiErrorMocks.getError(403, 'dailyLimit');
    const exception = parseGmailMessagesImportError(
      error.error,
      messageExternalId,
    );

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(exception?.message).toBe(
      `${error.error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 403 User Rate Limit Exceeded', () => {
    const error = gmailApiErrorMocks.getError(403, 'userRateLimit');
    const exception = parseGmailMessagesImportError(
      error.error,
      messageExternalId,
    );

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(exception?.message).toBe(
      `${error.error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 403 Rate Limit Exceeded', () => {
    const error = gmailApiErrorMocks.getError(403, 'rateLimit');
    const exception = parseGmailMessagesImportError(
      error.error,
      messageExternalId,
    );

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(exception?.message).toBe(
      `${error.error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 403 Domain Policy Error', () => {
    const error = gmailApiErrorMocks.getError(403, 'domainPolicy');
    const exception = parseGmailMessagesImportError(
      error.error,
      messageExternalId,
    );

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
    expect(exception?.message).toBe(
      `${error.error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 404 Not Found', () => {
    const error = gmailApiErrorMocks.getError(404);
    const exception = parseGmailMessagesImportError(
      error.error,
      messageExternalId,
    );

    expect(exception).toBe(undefined);
  });

  it('should handle 410 Gone', () => {
    const error = gmailApiErrorMocks.getError(410);
    const exception = parseGmailMessagesImportError(
      error.error,
      messageExternalId,
    );

    expect(exception).toBe(undefined);
  });

  it('should handle 429 Too Many Requests', () => {
    const error = gmailApiErrorMocks.getError(429, 'concurrent');
    const exception = parseGmailMessagesImportError(
      error.error,
      messageExternalId,
    );

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(exception?.message).toBe(
      `${error.error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 500 Backend Error', () => {
    const error = gmailApiErrorMocks.getError(500);
    const exception = parseGmailMessagesImportError(
      error.error,
      messageExternalId,
    );

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(exception?.message).toBe(
      `${error.error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });
});
