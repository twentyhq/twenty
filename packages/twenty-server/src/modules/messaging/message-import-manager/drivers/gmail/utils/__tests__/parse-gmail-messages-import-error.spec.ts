import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { default as gmailBatchApiErrorMocks } from 'src/modules/messaging/message-import-manager/drivers/gmail/mocks/gmail-batch-api-error-mocks';
import { parseGmailApiBatchError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-api-batch-error.util';

const messageExternalId = '123';

describe('parseGmailApiBatchError', () => {
  it('should handle 400 Bad Request', () => {
    const error = gmailBatchApiErrorMocks.getError(400);
    const exception = parseGmailApiBatchError(error, messageExternalId);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(MessageImportDriverExceptionCode.UNKNOWN);
    expect(exception?.message).toBe(
      `${error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 400 Invalid Grant', () => {
    const error = gmailBatchApiErrorMocks.getError(400, 'invalid_grant');
    const exception = parseGmailApiBatchError(error, messageExternalId);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
    expect(exception?.message).toBe(
      `${error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 400 Failed Precondition', () => {
    const error = gmailBatchApiErrorMocks.getError(400, 'failedPrecondition');
    const exception = parseGmailApiBatchError(error, messageExternalId);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 401 Invalid Credentials', () => {
    const error = gmailBatchApiErrorMocks.getError(401);
    const exception = parseGmailApiBatchError(error, messageExternalId);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
    expect(exception?.message).toBe(
      `${error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 403 Daily Limit Exceeded', () => {
    const error = gmailBatchApiErrorMocks.getError(403, 'dailyLimit');
    const exception = parseGmailApiBatchError(error, messageExternalId);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(exception?.message).toBe(
      `${error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 403 User Rate Limit Exceeded', () => {
    const error = gmailBatchApiErrorMocks.getError(403, 'userRateLimit');
    const exception = parseGmailApiBatchError(error, messageExternalId);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(exception?.message).toBe(
      `${error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 403 Rate Limit Exceeded', () => {
    const error = gmailBatchApiErrorMocks.getError(403, 'rateLimit');
    const exception = parseGmailApiBatchError(error, messageExternalId);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(exception?.message).toBe(
      `${error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 403 Domain Policy Error', () => {
    const error = gmailBatchApiErrorMocks.getError(403, 'domainPolicy');
    const exception = parseGmailApiBatchError(error, messageExternalId);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
    expect(exception?.message).toBe(
      `${error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 404 Not Found', () => {
    const error = gmailBatchApiErrorMocks.getError(404);
    const exception = parseGmailApiBatchError(error, messageExternalId);

    expect(exception).toBeUndefined();
  });

  it('should handle 410 Gone', () => {
    const error = gmailBatchApiErrorMocks.getError(410);
    const exception = parseGmailApiBatchError(error, messageExternalId);

    expect(exception).toBeUndefined();
  });

  it('should handle 429 Too Many Requests', () => {
    const error = gmailBatchApiErrorMocks.getError(429, 'concurrent');
    const exception = parseGmailApiBatchError(error, messageExternalId);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(exception?.message).toBe(
      `${error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });

  it('should handle 500 Backend Error', () => {
    const error = gmailBatchApiErrorMocks.getError(500);
    const exception = parseGmailApiBatchError(error, messageExternalId);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception?.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(exception?.message).toBe(
      `${error.errors[0].message} for message with externalId: ${messageExternalId}`,
    );
  });
});
