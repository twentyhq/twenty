import { randomUUID } from 'node:crypto';

import { http, HttpResponse } from 'msw';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/message-channel-seed-ids.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { type InboundEmailImportService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-import.service';

import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';

const INBOUND_EMAIL_DOMAIN = 'inbound.body-text.test';

const RAW_EMAIL_DOWNLOAD_BASE_URL = 'https://resend-raw.body-text.test';

const buildRawEmail = ({
  groupHandle,
  headerMessageId,
  contentType,
  body,
}: {
  groupHandle: string;
  headerMessageId: string;
  contentType: string;
  body: string;
}) =>
  [
    'From: PayPal <service@paypal.test>',
    `To: ${groupHandle}`,
    'Subject: Zahlungseingang',
    `Message-ID: ${headerMessageId}`,
    'Date: Mon, 14 Sep 2026 11:19:21 +0000',
    'MIME-Version: 1.0',
    `Content-Type: ${contentType}; charset=UTF-8`,
    '',
    body,
  ].join('\r\n');

describe('Inbound email body text (integration)', () => {
  const httpMock = setupHttpMock();

  const messageChannelRepository =
    getCoreRepository<MessageChannelEntity>(MessageChannelEntity);

  let groupChannelId: string;
  let groupHandle: string;

  const importEmail = async (rawEmail: string) => {
    const receivedEmailId = randomUUID();
    const downloadUrl = `${RAW_EMAIL_DOWNLOAD_BASE_URL}/${receivedEmailId}`;

    httpMock.use(
      http.get(
        `https://api.resend.com/emails/receiving/${receivedEmailId}`,
        () =>
          HttpResponse.json({
            id: receivedEmailId,
            from: 'service@paypal.test',
            to: [groupHandle],
            raw: { download_url: downloadUrl, expires_at: '2099-01-01' },
          }),
      ),
      http.get(downloadUrl, () => HttpResponse.text(rawEmail)),
    );

    const outcome = await getAppProviderByClassName<InboundEmailImportService>(
      'InboundEmailImportService',
    ).importInboundMessage({
      messageReference: { source: 'RESEND', reference: receivedEmailId },
      envelopeRecipients: [groupHandle],
    });

    expect(outcome.kind).toBe('imported');
  };

  const findTextOfMessage = (headerMessageId: string) => {
    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    return workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const message = await workspaceOrmManager
          .getRepository<MessageWorkspaceEntity>('message', {
            shouldBypassPermissionChecks: true,
          })
          .createQueryBuilder('message')
          .where('message.headerMessageId = :headerMessageId', {
            headerMessageId,
          })
          .getOne<MessageWorkspaceEntity>();

        return message?.text;
      },
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
      { lite: true },
    );
  };

  beforeAll(async () => {
    await updateConfigVariable({
      input: { key: 'INBOUND_EMAIL_DOMAIN', value: INBOUND_EMAIL_DOMAIN },
    });
    await updateConfigVariable({
      input: { key: 'RESEND_API_KEY', value: 're_integration_test' },
    });

    const seededGroupChannel = await messageChannelRepository.findOneByOrFail({
      id: MESSAGE_CHANNEL_DATA_SEED_IDS.SUPPORT_GROUP,
    });

    const { id: _id, ...groupChannelColumns } = seededGroupChannel;

    groupHandle = `ch_${randomUUID().replace(/-/g, '')}@${INBOUND_EMAIL_DOMAIN}`;

    const groupChannel = await messageChannelRepository.save({
      ...groupChannelColumns,
      handle: groupHandle,
    });

    groupChannelId = groupChannel.id;
  }, 60000);

  afterAll(async () => {
    await messageChannelRepository
      .delete({ id: groupChannelId })
      .catch(() => undefined);
  });

  it('stores the text of an email that only has an HTML body', async () => {
    const headerMessageId = `<${randomUUID()}@paypal.test>`;

    await importEmail(
      buildRawEmail({
        groupHandle,
        headerMessageId,
        contentType: 'text/html',
        body: '<html><body><p>Sie haben 49,00 EUR erhalten.</p></body></html>',
      }),
    );

    expect(await findTextOfMessage(headerMessageId)).toBe(
      'Sie haben 49,00 EUR erhalten.',
    );
  }, 60000);

  it('drops the quoted history of a reply', async () => {
    const headerMessageId = `<${randomUUID()}@gmail.test>`;

    await importEmail(
      buildRawEmail({
        groupHandle,
        headerMessageId,
        contentType: 'text/plain',
        body: [
          'Thanks, sounds good.',
          '',
          'On Mon, 14 Sep 2026 at 10:00, Archive <archive@acme.test> wrote:',
          '> Our spring offer',
        ].join('\r\n'),
      }),
    );

    expect(await findTextOfMessage(headerMessageId)).toBe(
      'Thanks, sounds good.',
    );
  }, 60000);
});
