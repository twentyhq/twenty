import { createHmac } from 'crypto';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { MailgunWebhookVerifierService } from 'src/modules/messaging-webhooks/adapters/mailgun/services/mailgun-webhook-verifier.service';

const SIGNING_KEY = 'mailgun-signing-key';

const signFields = (timestamp: string, token: string): string => {
  return createHmac('sha256', SIGNING_KEY)
    .update(`${timestamp}${token}`)
    .digest('hex');
};

describe('MailgunWebhookVerifierService', () => {
  let twentyConfigService: { get: jest.Mock };
  let verifier: MailgunWebhookVerifierService;

  beforeEach(() => {
    twentyConfigService = { get: jest.fn().mockReturnValue(SIGNING_KEY) };
    verifier = new MailgunWebhookVerifierService(
      twentyConfigService as unknown as TwentyConfigService,
    );
  });

  it('should accept a correctly signed payload', () => {
    const timestamp = `${Math.floor(Date.now() / 1000)}`;

    expect(() =>
      verifier.assertSigned({
        timestamp,
        token: 'token-value',
        signature: signFields(timestamp, 'token-value'),
      }),
    ).not.toThrow();
  });

  it('should reject signatures with trailing garbage after a valid digest', () => {
    const timestamp = `${Math.floor(Date.now() / 1000)}`;

    expect(() =>
      verifier.assertSigned({
        timestamp,
        token: 'token-value',
        signature: `${signFields(timestamp, 'token-value')}zz`,
      }),
    ).toThrow('Mailgun webhook signature invalid');
  });

  it('should reject a tampered token', () => {
    const timestamp = `${Math.floor(Date.now() / 1000)}`;

    expect(() =>
      verifier.assertSigned({
        timestamp,
        token: 'other-token',
        signature: signFields(timestamp, 'token-value'),
      }),
    ).toThrow('Mailgun webhook signature invalid');
  });

  it('should reject timestamps outside the tolerance window', () => {
    const staleTimestamp = `${Math.floor(Date.now() / 1000) - 10 * 60}`;

    expect(() =>
      verifier.assertSigned({
        timestamp: staleTimestamp,
        token: 'token-value',
        signature: signFields(staleTimestamp, 'token-value'),
      }),
    ).toThrow('Mailgun webhook timestamp outside tolerance');
  });

  it('should reject requests without signature fields', () => {
    expect(() =>
      verifier.assertSigned({
        timestamp: undefined,
        token: undefined,
        signature: undefined,
      }),
    ).toThrow('Missing Mailgun signature fields');
  });

  it('should reject when the signing key is not configured', () => {
    twentyConfigService.get.mockReturnValue(undefined);

    expect(() =>
      verifier.assertSigned({
        timestamp: `${Math.floor(Date.now() / 1000)}`,
        token: 'token-value',
        signature: 'abc',
      }),
    ).toThrow('MAILGUN_WEBHOOK_SIGNING_KEY is not configured');
  });
});
