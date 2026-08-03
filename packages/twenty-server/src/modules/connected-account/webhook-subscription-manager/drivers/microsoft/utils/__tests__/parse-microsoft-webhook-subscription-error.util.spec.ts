import { WebhookSubscriptionDriverExceptionCode } from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';
import { parseMicrosoftWebhookSubscriptionError } from 'src/modules/connected-account/webhook-subscription-manager/drivers/microsoft/utils/parse-microsoft-webhook-subscription-error.util';

describe('parseMicrosoftWebhookSubscriptionError', () => {
  it('should return INSUFFICIENT_PERMISSIONS when the mailbox is not enabled for the REST API', () => {
    const exception = parseMicrosoftWebhookSubscriptionError({
      statusCode: 404,
      code: 'MailboxNotEnabledForRESTAPI',
      message:
        'The mailbox is either inactive, soft-deleted, or is hosted on-premise.',
    });

    expect(exception.code).toBe(
      WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it('should return NOT_FOUND when the subscription no longer exists', () => {
    const exception = parseMicrosoftWebhookSubscriptionError({
      statusCode: 404,
      code: 'ResourceNotFound',
      message: 'The object was not found.',
    });

    expect(exception.code).toBe(
      WebhookSubscriptionDriverExceptionCode.NOT_FOUND,
    );
  });

  it.each([
    ['InvalidRequest', 'Failed to resolve domain example.invalid'],
    ['ValidationError', 'Subscription validation request failed.'],
  ])('should return UNKNOWN for the 400 code %s', (code, message) => {
    const exception = parseMicrosoftWebhookSubscriptionError({
      statusCode: 400,
      code,
      message,
    });

    expect(exception.code).toBe(WebhookSubscriptionDriverExceptionCode.UNKNOWN);
  });

  it('should return TEMPORARY_ERROR when a 400 carries no error body', () => {
    const exception = parseMicrosoftWebhookSubscriptionError({
      statusCode: 400,
    });

    expect(exception.code).toBe(
      WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR,
    );
  });

  it('should keep the provider error as the exception cause', () => {
    const providerError = new Error('graph exploded');

    const exception = parseMicrosoftWebhookSubscriptionError(
      { statusCode: 404, code: 'ResourceNotFound' },
      { cause: providerError },
    );

    expect(exception.cause).toBe(providerError);
  });

  it('should return INSUFFICIENT_PERMISSIONS on 403', () => {
    const exception = parseMicrosoftWebhookSubscriptionError({
      statusCode: 403,
      code: 'ErrorAccessDenied',
      message: 'Access is denied.',
    });

    expect(exception.code).toBe(
      WebhookSubscriptionDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  });

  it.each([401, 429, 500, 502, 503, 504, 509])(
    'should return TEMPORARY_ERROR on %i',
    (statusCode) => {
      const exception = parseMicrosoftWebhookSubscriptionError({ statusCode });

      expect(exception.code).toBe(
        WebhookSubscriptionDriverExceptionCode.TEMPORARY_ERROR,
      );
    },
  );

  it('should return UNKNOWN on an unhandled status code', () => {
    const exception = parseMicrosoftWebhookSubscriptionError({
      statusCode: 418,
    });

    expect(exception.code).toBe(WebhookSubscriptionDriverExceptionCode.UNKNOWN);
  });
});
