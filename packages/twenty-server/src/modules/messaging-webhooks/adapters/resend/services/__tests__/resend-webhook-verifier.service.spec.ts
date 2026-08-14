import { createHmac } from 'crypto';

import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ResendWebhookVerifierService } from 'src/modules/messaging-webhooks/adapters/resend/services/resend-webhook-verifier.service';

const SIGNING_SECRET_KEY = Buffer.from('resend-signing-secret').toString(
  'base64',
);
const SIGNING_SECRET = `whsec_${SIGNING_SECRET_KEY}`;

const signPayload = (
  svixId: string,
  svixTimestamp: string,
  payload: string,
): string => {
  const signature = createHmac(
    'sha256',
    Buffer.from(SIGNING_SECRET_KEY, 'base64'),
  )
    .update(`${svixId}.${svixTimestamp}.${payload}`)
    .digest('base64');

  return `v1,${signature}`;
};

describe('ResendWebhookVerifierService', () => {
  let twentyConfigService: { get: jest.Mock };
  let verifier: ResendWebhookVerifierService;

  const payload = JSON.stringify({ type: 'email.bounced' });

  beforeEach(() => {
    twentyConfigService = {
      get: jest.fn().mockReturnValue(SIGNING_SECRET),
    };
    verifier = new ResendWebhookVerifierService(
      twentyConfigService as unknown as TwentyConfigService,
    );
  });

  it('should accept a correctly signed payload', () => {
    const svixTimestamp = `${Math.floor(Date.now() / 1000)}`;

    expect(() =>
      verifier.assertSigned(Buffer.from(payload), {
        svixId: 'msg_1',
        svixTimestamp,
        svixSignature: signPayload('msg_1', svixTimestamp, payload),
      }),
    ).not.toThrow();
  });

  it('should accept when any signature in the list matches', () => {
    const svixTimestamp = `${Math.floor(Date.now() / 1000)}`;

    expect(() =>
      verifier.assertSigned(Buffer.from(payload), {
        svixId: 'msg_1',
        svixTimestamp,
        svixSignature: `v1,${Buffer.from('bogus').toString('base64')} ${signPayload('msg_1', svixTimestamp, payload)}`,
      }),
    ).not.toThrow();
  });

  it('should reject a tampered payload', () => {
    const svixTimestamp = `${Math.floor(Date.now() / 1000)}`;

    expect(() =>
      verifier.assertSigned(Buffer.from('{"type":"email.opened"}'), {
        svixId: 'msg_1',
        svixTimestamp,
        svixSignature: signPayload('msg_1', svixTimestamp, payload),
      }),
    ).toThrow('Resend webhook signature invalid');
  });

  it('should reject timestamps outside the tolerance window', () => {
    const staleTimestamp = `${Math.floor(Date.now() / 1000) - 10 * 60}`;

    expect(() =>
      verifier.assertSigned(Buffer.from(payload), {
        svixId: 'msg_1',
        svixTimestamp: staleTimestamp,
        svixSignature: signPayload('msg_1', staleTimestamp, payload),
      }),
    ).toThrow('Resend webhook timestamp outside tolerance');
  });

  it('should reject requests without signature headers', () => {
    expect(() =>
      verifier.assertSigned(Buffer.from(payload), {
        svixId: undefined,
        svixTimestamp: undefined,
        svixSignature: undefined,
      }),
    ).toThrow('Missing Svix signature headers');
  });

  it('should reject when the signing secret is not configured', () => {
    twentyConfigService.get.mockReturnValue(undefined);

    expect(() =>
      verifier.assertSigned(Buffer.from(payload), {
        svixId: 'msg_1',
        svixTimestamp: `${Math.floor(Date.now() / 1000)}`,
        svixSignature: 'v1,abc',
      }),
    ).toThrow('RESEND_WEBHOOK_SIGNING_SECRET is not configured');
  });
});
