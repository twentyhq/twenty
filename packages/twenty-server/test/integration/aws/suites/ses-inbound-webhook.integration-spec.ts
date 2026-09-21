import { randomUUID } from 'node:crypto';

import { http, HttpResponse } from 'msw';
import request from 'supertest';

import { MessageSuppressionEntity } from 'src/engine/core-modules/emailing-domain/message-suppression.entity';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import {
  snsNotification,
  snsSigningCertHandler,
  snsSubscriptionConfirmation,
} from 'test/integration/aws/mocks/sns-payload.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';

const ALLOWED_TOPIC_ARN =
  'arn:aws:sns:eu-west-3:000000000000:twenty-ses-inbound-test';

const SES_INBOUND_WEBHOOK_PATH = '/webhooks/messaging/ses/inbound';

const SUBSCRIBE_URL =
  'https://sns.eu-west-3.amazonaws.com/?Action=ConfirmSubscription&Token=test-token';

const inboundNotification = ({
  recipients,
  subject,
  actionType = 'S3',
}: {
  recipients: string[];
  subject?: string;
  actionType?: string;
}) => ({
  mail: { commonHeaders: { subject } },
  receipt: {
    recipients,
    action: { type: actionType, objectKey: `inbound/${randomUUID()}` },
  },
});

const postSesInboundWebhook = (payload: Record<string, string>) =>
  request(`http://localhost:${APP_PORT}`)
    .post(SES_INBOUND_WEBHOOK_PATH)
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(payload));

describe('SES inbound webhook (integration)', () => {
  const httpMock = setupHttpMock(snsSigningCertHandler());

  let unsubscribeTokenService: UnsubscribeTokenService;

  const findSuppressionReasons = async (emailAddress: string) => {
    const suppressions = await getCoreRepository<MessageSuppressionEntity>(
      MessageSuppressionEntity,
    ).findBy({ workspaceId: SEED_APPLE_WORKSPACE_ID, emailAddress });

    return suppressions.map((suppression) => suppression.reason);
  };

  const postUnsubscribeMail = (subject?: string) =>
    postSesInboundWebhook(
      snsNotification({
        topicArn: ALLOWED_TOPIC_ARN,
        message: inboundNotification({
          recipients: ['unsubscribe@campaigns.acme.com'],
          subject,
        }),
      }),
    );

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'SES_SNS_TOPIC_ARN_ALLOWLIST', value: ALLOWED_TOPIC_ARN },
    });

    unsubscribeTokenService =
      getAppProviderByClassName<UnsubscribeTokenService>(
        'UnsubscribeTokenService',
      );
  }, 60000);

  it('suppresses the sender of a valid unsubscribe email', async () => {
    const emailAddress = `unsub-${randomUUID()}@acme.com`;

    const response = await postUnsubscribeMail(
      unsubscribeTokenService.sign({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        emailAddress,
      }),
    );

    expect(response.status).toBe(200);
    expect(await findSuppressionReasons(emailAddress)).toEqual([
      MessageSuppressionReason.UNSUBSCRIBE,
    ]);
  }, 60000);

  it('suppresses nothing for a preview unsubscribe token', async () => {
    const emailAddress = `preview-${randomUUID()}@acme.com`;

    const response = await postUnsubscribeMail(
      unsubscribeTokenService.sign({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        emailAddress,
        preview: true,
      }),
    );

    expect(response.status).toBe(200);
    expect(await findSuppressionReasons(emailAddress)).toEqual([]);
  }, 60000);

  it('ignores an unsubscribe email whose subject is not a valid token', async () => {
    const response = await postUnsubscribeMail('please unsubscribe me');

    expect(response.status).toBe(200);
  }, 60000);

  it('ignores an unsubscribe email that carries no subject', async () => {
    const response = await postUnsubscribeMail();

    expect(response.status).toBe(200);
  }, 60000);

  it('ignores an inbound email delivered through an unsupported action', async () => {
    const response = await postSesInboundWebhook(
      snsNotification({
        topicArn: ALLOWED_TOPIC_ARN,
        message: inboundNotification({
          recipients: ['sales@campaigns.acme.com'],
          actionType: 'Lambda',
        }),
      }),
    );

    expect(response.status).toBe(200);
  }, 60000);

  it('confirms an SNS subscription by calling the subscribe URL', async () => {
    let subscribeUrlWasCalled = false;

    httpMock.use(
      http.get(SUBSCRIBE_URL, () => {
        subscribeUrlWasCalled = true;

        return HttpResponse.text('<ConfirmSubscriptionResponse />');
      }),
    );

    const response = await postSesInboundWebhook(
      snsSubscriptionConfirmation({
        topicArn: ALLOWED_TOPIC_ARN,
        subscribeUrl: SUBSCRIBE_URL,
      }),
    );

    expect(response.status).toBe(200);
    expect(subscribeUrlWasCalled).toBe(true);
  }, 60000);

  it('rejects an inbound notification from a topic outside the allowlist', async () => {
    const response = await postSesInboundWebhook(
      snsNotification({
        topicArn: 'arn:aws:sns:eu-west-3:000000000000:some-other-topic',
        message: inboundNotification({
          recipients: ['sales@campaigns.acme.com'],
        }),
      }),
    );

    expect(response.status).toBe(403);
  }, 60000);

  it('rejects an inbound body that is not valid JSON', async () => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .post(SES_INBOUND_WEBHOOK_PATH)
      .set('Content-Type', 'application/json')
      .send('not-json');

    expect(response.status).toBe(400);
  }, 60000);

  it('rejects an inbound notification whose signature does not verify', async () => {
    const response = await postSesInboundWebhook(
      snsNotification({
        topicArn: ALLOWED_TOPIC_ARN,
        signed: false,
        message: inboundNotification({
          recipients: ['sales@campaigns.acme.com'],
        }),
      }),
    );

    expect(response.status).toBe(403);
  }, 60000);
});
