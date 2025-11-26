import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import gmailApiErrorMocks from 'src/modules/messaging/message-import-manager/drivers/gmail/mocks/gmail-api-error-mocks';
import { parseGmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-api-error.util';

describe('parseGmailApiError', () => {
  it('should handle 400 Bad Request', () => {
    const error = gmailApiErrorMocks.getError(400);
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(MessageImportDriverExceptionCode.UNKNOWN);
  });

  it('should handle 400 Invalid Grant', () => {
    const error = gmailApiErrorMocks.getError(400, 'invalid_grant');
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should handle 400 Failed Precondition', () => {
    const error = gmailApiErrorMocks.getError(400, 'failedPrecondition');
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 401 Invalid Credentials', () => {
    const error = gmailApiErrorMocks.getError(401);
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should handle 403 Daily Limit Exceeded', () => {
    const error = gmailApiErrorMocks.getError(403, 'dailyLimit');
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 403 User Rate Limit Exceeded', () => {
    const error = gmailApiErrorMocks.getError(403, 'userRateLimit');
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 403 Rate Limit Exceeded', () => {
    const error = gmailApiErrorMocks.getError(403, 'rateLimit');
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 403 Domain Policy Error', () => {
    const error = gmailApiErrorMocks.getError(403, 'domainPolicy');
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should handle 404 as sync cursor error', () => {
    const error = gmailApiErrorMocks.getError(404);
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
    );
  });

  it('should handle 410 Gone', () => {
    const error = gmailApiErrorMocks.getError(410);
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(MessageImportDriverExceptionCode.UNKNOWN);
  });

  it('should handle 429 Too Many Requests', () => {
    const error = gmailApiErrorMocks.getError(429, 'concurrent');
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should handle 500 Backend Error', () => {
    const error = gmailApiErrorMocks.getError(500);
    const exception = parseGmailApiError(error);

    expect(exception).toBeInstanceOf(MessageImportDriverException);
    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });
});
