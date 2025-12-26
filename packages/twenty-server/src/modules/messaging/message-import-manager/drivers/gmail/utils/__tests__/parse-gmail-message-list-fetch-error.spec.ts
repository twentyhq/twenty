import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { getGmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/mocks/gmail-api-error-mocks';
import { parseGmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-api-error.util';

describe('parseGmailApiError', () => {
  it('should handle 400 Bad Request', () => {
    const error = getGmailApiError({ code: 400 });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(MessageImportDriverExceptionCode.UNKNOWN);
  });

  it('should handle 400 Invalid Grant', () => {
    const error = getGmailApiError({ code: 400, reason: 'invalid_grant' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should handle 400 Failed Precondition', () => {
    const error = getGmailApiError({ code: 400, reason: 'failedPrecondition' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 401 Invalid Credentials', () => {
    const error = getGmailApiError({ code: 401 });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should handle 403 Daily Limit Exceeded', () => {
    const error = getGmailApiError({ code: 403, reason: 'dailyLimit' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 403 User Rate Limit Exceeded', () => {
    const error = getGmailApiError({ code: 403, reason: 'userRateLimit' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 403 Rate Limit Exceeded', () => {
    const error = getGmailApiError({ code: 403, reason: 'rateLimit' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 403 Domain Policy Error', () => {
    const error = getGmailApiError({ code: 403, reason: 'domainPolicy' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should handle 404 as sync cursor error', () => {
    const error = getGmailApiError({ code: 404 });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
    );
  });

  it('should handle 410 Gone', () => {
    const error = getGmailApiError({ code: 410 });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(MessageImportDriverExceptionCode.UNKNOWN);
  });

  it('should handle 429 Too Many Requests', () => {
    const error = getGmailApiError({ code: 429, reason: 'rateLimit' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 500 Backend Error', () => {
    const error = getGmailApiError({ code: 500, reason: 'backendError' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 400 Bad Request with errorCodeAsString', () => {
    const error = getGmailApiError({ code: 400, reason: 'badRequest' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(MessageImportDriverExceptionCode.UNKNOWN);
  });

  it('should handle 400 Invalid Grant with errorCodeAsString', () => {
    const error = getGmailApiError({ code: 400, reason: 'invalid_grant' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should handle 400 Failed Precondition with errorCodeAsString', () => {
    const error = getGmailApiError({ code: 400, reason: 'failedPrecondition' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 401 Invalid Credentials with errorCodeAsString', () => {
    const error = getGmailApiError({ code: 401 });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should handle 403 Daily Limit Exceeded with errorCodeAsString', () => {
    const error = getGmailApiError({ code: 403, reason: 'dailyLimit' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 403 User Rate Limit Exceeded with errorCodeAsString', () => {
    const error = getGmailApiError({ code: 403, reason: 'userRateLimit' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 403 Rate Limit Exceeded with errorCodeAsString', () => {
    const error = getGmailApiError({ code: 403, reason: 'rateLimit' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 403 Domain Policy Error with errorCodeAsString', () => {
    const error = getGmailApiError({ code: 403, reason: 'domainPolicy' });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should handle 404 as sync cursor error with errorCodeAsString', () => {
    const error = getGmailApiError({ code: 404 });
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
    );
  });
});
