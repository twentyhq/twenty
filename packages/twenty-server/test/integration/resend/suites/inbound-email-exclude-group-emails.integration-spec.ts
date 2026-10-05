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

const INBOUND_EMAIL_DOMAIN = 'inbound.exclude-group.test';

const RAW_EMAIL_DOWNLOAD_BASE_URL = 'https://resend-raw.exclude-group.test';

const buildRawEmail = ({
  from,
  groupHandle,
  headerMessageId,
}: {
  from: string;
  groupHandle: string;
  headerMessageId: string;
}) =>
  [
    `From: ${from}`,
    `To: ${groupHandle}`,
    'Subject: Your order',
    `Message-ID: ${headerMessageId}`,
    'Date: Mon, 14 Sep 2026 11:19:21 +0000',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    'Hello',
  ].join('\r\n');

describe('Inbound email exclude group emails (integration)', () => {
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
            to: [groupHandle],
            raw: { download_url: downloadUrl, expires_at: '2099-01-01' },
          }),
      ),
      http.get(downloadUrl, () => HttpResponse.text(rawEmail)),
    );

    return getAppProviderByClassName<InboundEmailImportService>(
      'InboundEmailImportService',
    ).importInboundMessage({
      messageReference: { source: 'RESEND', reference: receivedEmailId },
      envelopeRecipients: [groupHandle],
    });
  };

  const findMessage = (headerMessageId: string) => {
    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    return workspaceOrmManager.executeInWorkspaceContext(
      () =>
        workspaceOrmManager
          .getRepository<MessageWorkspaceEntity>('message', {
            shouldBypassPermissionChecks: true,
          })
          .createQueryBuilder('message')
          .where('message.headerMessageId = :headerMessageId', {
            headerMessageId,
          })
          .getOne<MessageWorkspaceEntity>(),
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
      excludeGroupEmails: true,
    });

    groupChannelId = groupChannel.id;
  }, 60000);

  afterAll(async () => {
    await messageChannelRepository
      .delete({ id: groupChannelId })
      .catch(() => undefined);
  });

  it('skips an email sent from a group address', async () => {
    const headerMessageId = `<${randomUUID()}@shop.test>`;

    const outcome = await importEmail(
      buildRawEmail({
        from: 'Shop <noreply@shop.test>',
        groupHandle,
        headerMessageId,
      }),
    );

    expect(outcome.kind).toBe('excluded');
    expect(
      (await findMessage(headerMessageId))?.headerMessageId,
    ).toBeUndefined();
  }, 60000);

  it('imports an email sent from a person', async () => {
    const headerMessageId = `<${randomUUID()}@customer.test>`;

    const outcome = await importEmail(
      buildRawEmail({
        from: 'Customer <jane@customer.test>',
        groupHandle,
        headerMessageId,
      }),
    );

    expect(outcome.kind).toBe('imported');
    expect((await findMessage(headerMessageId))?.headerMessageId).toBe(
      headerMessageId,
    );
  }, 60000);
});
