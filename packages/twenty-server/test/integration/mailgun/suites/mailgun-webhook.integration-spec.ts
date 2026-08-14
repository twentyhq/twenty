import { createHmac, randomUUID } from 'node:crypto';

import request from 'supertest';

import { MessageSuppressionEntity } from 'src/engine/core-modules/emailing-domain/message-suppression.entity';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

const SIGNING_KEY = 'mailgun-integration-signing-key';

const MAILGUN_OUTBOUND_WEBHOOK_PATH = '/webhooks/messaging/mailgun/outbound';
const MAILGUN_INBOUND_WEBHOOK_PATH = '/webhooks/messaging/mailgun/inbound';

const signedFields = ({ signed = true }: { signed?: boolean } = {}) => {
  const timestamp = `${Math.floor(Date.now() / 1000)}`;
  const token = `token-${randomUUID()}`;
  const signature = signed
    ? createHmac('sha256', SIGNING_KEY).update(`${timestamp}${token}`).digest('hex')
    : 'f'.repeat(64);

  return { timestamp, token, signature };
};

const postOutboundEvent = (
  eventData: Record<string, unknown>,
  { signed = true }: { signed?: boolean } = {},
) =>
  request(`http://localhost:${APP_PORT}`)
    .post(MAILGUN_OUTBOUND_WEBHOOK_PATH)
    .set('Content-Type', 'application/json')
    .send(
      JSON.stringify({
        signature: signedFields({ signed }),
        'event-data': eventData,
      }),
    );

describe('Mailgun webhook (integration)', () => {
  let unsubscribeTokenService: UnsubscribeTokenService;

  const findSuppressionReasons = async (emailAddress: string) => {
    const suppressions = await getCoreRepository<MessageSuppressionEntity>(
      MessageSuppressionEntity,
    ).findBy({ workspaceId: SEED_APPLE_WORKSPACE_ID, emailAddress });

    return suppressions.map((suppression) => suppression.reason);
  };

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'MAILGUN_WEBHOOK_SIGNING_KEY', value: SIGNING_KEY },
    });

    unsubscribeTokenService =
      getAppProviderByClassName<UnsubscribeTokenService>(
        'UnsubscribeTokenService',
      );
  }, 60000);

  it('suppresses the recipient of a permanently failed delivery', async () => {
    const emailAddress = `bounce-${randomUUID()}@acme.com`;

    const response = await postOutboundEvent({
      id: `event-${randomUUID()}`,
      event: 'failed',
      severity: 'permanent',
      recipient: emailAddress,
      'user-variables': { workspace_id: SEED_APPLE_WORKSPACE_ID },
    });

    expect(response.status).toBe(200);
    expect(await findSuppressionReasons(emailAddress)).toEqual([
      MessageSuppressionReason.BOUNCE,
    ]);
  }, 60000);

  it('suppresses the recipient of a complaint', async () => {
    const emailAddress = `complaint-${randomUUID()}@acme.com`;

    const response = await postOutboundEvent({
      id: `event-${randomUUID()}`,
      event: 'complained',
      recipient: emailAddress,
      'user-variables': { workspace_id: SEED_APPLE_WORKSPACE_ID },
    });

    expect(response.status).toBe(200);
    expect(await findSuppressionReasons(emailAddress)).toEqual([
      MessageSuppressionReason.COMPLAINT,
    ]);
  }, 60000);

  it('suppresses nothing for a temporary delivery failure', async () => {
    const emailAddress = `transient-${randomUUID()}@acme.com`;

    const response = await postOutboundEvent({
      id: `event-${randomUUID()}`,
      event: 'failed',
      severity: 'temporary',
      recipient: emailAddress,
      'user-variables': { workspace_id: SEED_APPLE_WORKSPACE_ID },
    });

    expect(response.status).toBe(200);
    expect(await findSuppressionReasons(emailAddress)).toEqual([]);
  }, 60000);

  it('suppresses nothing for an event without a workspace variable', async () => {
    const emailAddress = `untagged-${randomUUID()}@acme.com`;

    const response = await postOutboundEvent({
      id: `event-${randomUUID()}`,
      event: 'failed',
      severity: 'permanent',
      recipient: emailAddress,
    });

    expect(response.status).toBe(200);
    expect(await findSuppressionReasons(emailAddress)).toEqual([]);
  }, 60000);

  it('rejects an outbound event whose signature does not verify', async () => {
    const response = await postOutboundEvent(
      {
        id: `event-${randomUUID()}`,
        event: 'failed',
        severity: 'permanent',
        recipient: `rejected-${randomUUID()}@acme.com`,
        'user-variables': { workspace_id: SEED_APPLE_WORKSPACE_ID },
      },
      { signed: false },
    );

    expect(response.status).toBe(403);
  }, 60000);

  it('rejects a signed payload without event data', async () => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .post(MAILGUN_OUTBOUND_WEBHOOK_PATH)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ signature: signedFields() }));

    expect(response.status).toBe(400);
  }, 60000);

  it('routes an urlencoded inbound notification to the unsubscribe mailbox', async () => {
    const emailAddress = `unsub-${randomUUID()}@acme.com`;
    const fields = signedFields();

    const response = await request(`http://localhost:${APP_PORT}`)
      .post(MAILGUN_INBOUND_WEBHOOK_PATH)
      .type('form')
      .send({
        ...fields,
        recipient: 'unsubscribe@campaigns.acme.com',
        subject: unsubscribeTokenService.sign({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          emailAddress,
        }),
        'message-url':
          'https://storage.eu.mailgun.net/v3/domains/campaigns.acme.com/messages/abc123',
      });

    expect(response.status).toBe(200);
    expect(await findSuppressionReasons(emailAddress)).toEqual([
      MessageSuppressionReason.UNSUBSCRIBE,
    ]);
  }, 60000);

  it('routes a multipart inbound notification to the unsubscribe mailbox', async () => {
    const emailAddress = `unsub-multipart-${randomUUID()}@acme.com`;
    const fields = signedFields();
    const boundary = `----mailgun${randomUUID().replace(/-/g, '')}`;

    const multipartFields = {
      ...fields,
      recipient: 'unsubscribe@campaigns.acme.com',
      subject: unsubscribeTokenService.sign({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        emailAddress,
      }),
      'message-url':
        'https://storage.eu.mailgun.net/v3/domains/campaigns.acme.com/messages/def456',
    };

    const body = [
      ...Object.entries(multipartFields).map(
        ([name, value]) =>
          `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
      ),
      `--${boundary}\r\nContent-Disposition: form-data; name="attachment-1"; filename="mail.pdf"\r\nContent-Type: application/pdf\r\n\r\nbinary-not-a-field\r\n`,
      `--${boundary}--\r\n`,
    ].join('');

    const response = await request(`http://localhost:${APP_PORT}`)
      .post(MAILGUN_INBOUND_WEBHOOK_PATH)
      .set('Content-Type', `multipart/form-data; boundary=${boundary}`)
      .send(body);

    expect(response.status).toBe(200);
    expect(await findSuppressionReasons(emailAddress)).toEqual([
      MessageSuppressionReason.UNSUBSCRIBE,
    ]);
  }, 60000);

  it('rejects an inbound notification whose signature does not verify', async () => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .post(MAILGUN_INBOUND_WEBHOOK_PATH)
      .type('form')
      .send({
        ...signedFields({ signed: false }),
        recipient: 'unsubscribe@campaigns.acme.com',
        subject: 'irrelevant',
        'message-url':
          'https://storage.eu.mailgun.net/v3/domains/campaigns.acme.com/messages/ghi789',
      });

    expect(response.status).toBe(403);
  }, 60000);

  it('rejects an inbound notification without a message url', async () => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .post(MAILGUN_INBOUND_WEBHOOK_PATH)
      .type('form')
      .send({
        ...signedFields(),
        recipient: 'sales@campaigns.acme.com',
        subject: 'Hello',
      });

    expect(response.status).toBe(400);
  }, 60000);
});
