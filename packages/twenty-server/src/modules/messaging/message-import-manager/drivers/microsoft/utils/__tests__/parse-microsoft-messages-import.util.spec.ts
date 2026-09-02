import { MessageImportDriverExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { parseMicrosoftMessagesImportError } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/parse-microsoft-messages-import.util';

describe('parseMicrosoftMessagesImportError', () => {
  it('should be temporary when the access token is expired so the next attempt can refresh it', () => {
    const exception = parseMicrosoftMessagesImportError({
      statusCode: 401,
      code: 'InvalidAuthenticationToken',
      message: 'Lifetime validation failed, the token is expired.',
    });

    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should keep the Microsoft error code and message so the failure stays diagnosable', () => {
    const exception = parseMicrosoftMessagesImportError({
      statusCode: 401,
      code: 'InvalidAuthenticationToken',
      message: 'Lifetime validation failed, the token is expired.',
    });

    expect(exception.message).toContain('InvalidAuthenticationToken');
    expect(exception.message).toContain(
      'Lifetime validation failed, the token is expired.',
    );
  });

  it('should be temporary when access is denied because Graph 403s can be transient mailbox-level denials', () => {
    const exception = parseMicrosoftMessagesImportError({
      statusCode: 403,
      code: 'ErrorAccessDenied',
      message: 'Access is denied. Check credentials and try again.',
    });

    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
    expect(exception.message).toContain('ErrorAccessDenied');
  });

  it('should be insufficient permissions when the mailbox is not enabled for the REST API', () => {
    const exception = parseMicrosoftMessagesImportError({
      statusCode: 404,
      code: 'MailboxNotEnabledForRESTAPI',
      message:
        'The mailbox is either inactive, soft-deleted, or is hosted on-premise.',
    });

    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should classify the mailbox error on its code rather than its message wording', () => {
    const exception = parseMicrosoftMessagesImportError({
      statusCode: 404,
      code: 'MailboxNotEnabledForRESTAPI',
      message: 'Some reworded message from Microsoft.',
    });

    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should be insufficient permissions when the account has no valid licence', () => {
    const exception = parseMicrosoftMessagesImportError({
      statusCode: 403,
      code: 'ErrorInvalidLicense',
      message: 'The license of the user is invalid.',
    });

    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should be insufficient permissions when a shared mailbox is not enabled for the REST API', () => {
    const exception = parseMicrosoftMessagesImportError({
      statusCode: 404,
      code: 'RESTAPINotEnabledForComponentSharedMailbox',
      message: 'REST API is not yet supported for this mailbox.',
    });

    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should be insufficient permissions on a dead-account code regardless of status code', () => {
    const exception = parseMicrosoftMessagesImportError({
      statusCode: 500,
      code: 'ErrorNonExistentMailbox',
      message: 'The SMTP address has no mailbox associated with it.',
    });

    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should be insufficient permissions when the tenant is marked for removal', () => {
    const exception = parseMicrosoftMessagesImportError({
      statusCode: 403,
      code: 'ErrorOrganizationAccessBlocked',
      message: 'The tenant is marked for removal.',
    });

    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should be not found for a 404 that is not a mailbox error', () => {
    const exception = parseMicrosoftMessagesImportError({
      statusCode: 404,
      code: 'ResourceNotFound',
      message: 'Resource not found.',
    });

    expect(exception.code).toBe(MessageImportDriverExceptionCode.NOT_FOUND);
  });

  it('should be a sync cursor error when the delta token is no longer valid', () => {
    const exception = parseMicrosoftMessagesImportError({
      statusCode: 410,
      code: 'SyncStateNotFound',
      message: 'The sync state is not found.',
    });

    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
    );
  });

  it('should be temporary when throttled', () => {
    const exception = parseMicrosoftMessagesImportError({
      statusCode: 429,
      code: 'TooManyRequests',
      message: 'Please retry again later.',
    });

    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should be temporary when a 400 has an empty error body', () => {
    const exception = parseMicrosoftMessagesImportError({ statusCode: 400 });

    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should be temporary for an unhandled status code so channels are never killed on unrecognized errors', () => {
    const exception = parseMicrosoftMessagesImportError({
      statusCode: 418,
      message: 'I am a teapot.',
    });

    expect(exception.code).toBe(
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  });
});
