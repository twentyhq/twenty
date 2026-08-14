import { createHmac, randomUUID } from 'node:crypto';

import request from 'supertest';

import { MessageSuppressionEntity } from 'src/engine/core-modules/emailing-domain/message-suppression.entity';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

const SECRET_BYTES = Buffer.from('resend-integration-signing-secret');
const SIGNING_SECRET = `whsec_${SECRET_BYTES.toString('base64')}`;

const RESEND_WEBHOOK_PATH = '/webhooks/messaging/resend';

const signRawBody = ({
  svixId,
  svixTimestamp,
  rawBody,
}: {
  svixId: string;
  svixTimestamp: string;
  rawBody: string;
}) =>
  createHmac('sha256', SECRET_BYTES)
    .update(`${svixId}.${svixTimestamp}.${rawBody}`)
    .digest('base64');

const postResendWebhook = (
  rawBody: string,
  { signed = true }: { signed?: boolean } = {},
) => {
  const svixId = `msg_${randomUUID()}`;
  const svixTimestamp = `${Math.floor(Date.now() / 1000)}`;
  const signature = signed
    ? signRawBody({ svixId, svixTimestamp, rawBody })
    : Buffer.from('invalid-signature-material').toString('base64');

  return request(`http://localhost:${APP_PORT}`)
    .post(RESEND_WEBHOOK_PATH)
    .set('Content-Type', 'application/json')
    .set('svix-id', svixId)
    .set('svix-timestamp', svixTimestamp)
    .set('svix-signature', `v1,${signature}`)
    .send(rawBody);
};

describe('Resend webhook (integration)', () => {
  let unsubscribeTokenService: UnsubscribeTokenService;

  const findSuppressionReasons = async (emailAddress: string) => {
    const suppressions = await getCoreRepository<MessageSuppressionEntity>(
      MessageSuppressionEntity,
    ).findBy({ workspaceId: SEED_APPLE_WORKSPACE_ID, emailAddress });

    return suppressions.map((suppression) => suppression.reason);
  };

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'RESEND_WEBHOOK_SIGNING_SECRET', value: SIGNING_SECRET },
    });

    unsubscribeTokenService =
      getAppProviderByClassName<UnsubscribeTokenService>(
        'UnsubscribeTokenService',
      );
  }, 60000);

  it('suppresses recipients of a permanently bounced email', async () => {
    const emailAddress = `bounce-${randomUUID()}@acme.com`;

    const response = await postResendWebhook(
      JSON.stringify({
        type: 'email.bounced',
        data: {
          email_id: `email_${randomUUID()}`,
          to: [emailAddress],
          bounce: { type: 'Permanent' },
          tags: { workspace_id: SEED_APPLE_WORKSPACE_ID },
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(await findSuppressionReasons(emailAddress)).toEqual([
      MessageSuppressionReason.BOUNCE,
    ]);
  }, 60000);

  it('suppresses recipients of a complained email carrying array-shaped tags', async () => {
    const emailAddress = `complaint-${randomUUID()}@acme.com`;

    const response = await postResendWebhook(
      JSON.stringify({
        type: 'email.complained',
        data: {
          email_id: `email_${randomUUID()}`,
          to: [emailAddress],
          tags: [{ name: 'workspace_id', value: SEED_APPLE_WORKSPACE_ID }],
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(await findSuppressionReasons(emailAddress)).toEqual([
      MessageSuppressionReason.COMPLAINT,
    ]);
  }, 60000);

  it('suppresses nothing for a transient bounce', async () => {
    const emailAddress = `transient-${randomUUID()}@acme.com`;

    const response = await postResendWebhook(
      JSON.stringify({
        type: 'email.bounced',
        data: {
          email_id: `email_${randomUUID()}`,
          to: [emailAddress],
          bounce: { type: 'Transient' },
          tags: { workspace_id: SEED_APPLE_WORKSPACE_ID },
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(await findSuppressionReasons(emailAddress)).toEqual([]);
  }, 60000);

  it('suppresses nothing for a bounce without a workspace tag', async () => {
    const emailAddress = `untagged-${randomUUID()}@acme.com`;

    const response = await postResendWebhook(
      JSON.stringify({
        type: 'email.bounced',
        data: {
          email_id: `email_${randomUUID()}`,
          to: [emailAddress],
          bounce: { type: 'Permanent' },
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(await findSuppressionReasons(emailAddress)).toEqual([]);
  }, 60000);

  it('suppresses the sender of a received email addressed to the unsubscribe mailbox', async () => {
    const emailAddress = `unsub-${randomUUID()}@acme.com`;

    const response = await postResendWebhook(
      JSON.stringify({
        type: 'email.received',
        data: {
          email_id: `email_${randomUUID()}`,
          received_for: ['unsubscribe@campaigns.acme.com'],
          subject: unsubscribeTokenService.sign({
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            emailAddress,
          }),
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(await findSuppressionReasons(emailAddress)).toEqual([
      MessageSuppressionReason.UNSUBSCRIBE,
    ]);
  }, 60000);

  it('ignores event types it does not handle', async () => {
    const response = await postResendWebhook(
      JSON.stringify({
        type: 'email.delivered',
        data: { email_id: `email_${randomUUID()}` },
      }),
    );

    expect(response.status).toBe(200);
  }, 60000);

  it('rejects a payload whose signature does not verify', async () => {
    const response = await postResendWebhook(
      JSON.stringify({
        type: 'email.bounced',
        data: {
          email_id: `email_${randomUUID()}`,
          to: [`rejected-${randomUUID()}@acme.com`],
          bounce: { type: 'Permanent' },
          tags: { workspace_id: SEED_APPLE_WORKSPACE_ID },
        },
      }),
      { signed: false },
    );

    expect(response.status).toBe(403);
  }, 60000);

  it('rejects a payload without Svix signature headers', async () => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .post(RESEND_WEBHOOK_PATH)
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ type: 'email.bounced' }));

    expect(response.status).toBe(403);
  }, 60000);

  it('rejects a correctly signed body that is not valid JSON', async () => {
    const response = await postResendWebhook('not-json');

    expect(response.status).toBe(400);
  }, 60000);
});
