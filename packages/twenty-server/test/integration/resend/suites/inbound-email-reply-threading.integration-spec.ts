import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { http, HttpResponse } from 'msw';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/message-channel-seed-ids.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { type InboundEmailImportService } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/services/inbound-email-import.service';

import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';

const INBOUND_EMAIL_DOMAIN = 'inbound.threading.test';

const RAW_EMAIL_DOWNLOAD_BASE_URL = 'https://resend-raw.threading.test';

const buildRawReply = ({
  groupHandle,
  headerMessageId,
  inReplyTo,
  references,
}: {
  groupHandle: string;
  headerMessageId: string;
  inReplyTo?: string;
  references?: string;
}) => {
  const headerLines = [
    'From: Customer <customer@external.test>',
    `To: ${groupHandle}`,
    'Subject: Re: Spring offer',
    `Message-ID: ${headerMessageId}`,
    'Date: Mon, 14 Sep 2026 11:19:21 +0000',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
  ];

  if (isNonEmptyString(inReplyTo)) {
    headerLines.push(`In-Reply-To: ${inReplyTo}`);
  }

  if (isNonEmptyString(references)) {
    headerLines.push(`References: ${references}`);
  }

  return [...headerLines, '', 'Thanks, sounds good.'].join('\r\n');
};

describe('Inbound email reply threading (integration)', () => {
  const httpMock = setupHttpMock();

  const messageChannelRepository =
    getCoreRepository<MessageChannelEntity>(MessageChannelEntity);

  let groupChannelId: string;
  let groupHandle: string;

  const inWorkspace = <TResult>(
    work: (workspaceOrmManager: WorkspaceOrmManager) => Promise<TResult>,
  ): Promise<TResult> => {
    const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    return workspaceOrmManager.executeInWorkspaceContext(
      () => work(workspaceOrmManager),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
      { lite: true },
    );
  };

  const buildSesProviderMessageId = () =>
    `010701a0${randomUUID().replace(/-/g, '').slice(0, 8)}-${randomUUID()}-000000`;

  const seedSentMessage = ({
    messageChannelId,
    providerMessageId,
    threadExternalId,
  }: {
    messageChannelId: string;
    providerMessageId: string;
    threadExternalId: string;
  }) =>
    inWorkspace(async (workspaceOrmManager) => {
      const messageThreadId = randomUUID();
      const messageId = randomUUID();

      await workspaceOrmManager
        .getRepository<MessageThreadWorkspaceEntity>('messageThread')
        .insert({ id: messageThreadId });

      await workspaceOrmManager
        .getRepository<MessageWorkspaceEntity>('message')
        .insert({
          id: messageId,
          headerMessageId: providerMessageId,
          subject: 'Spring offer',
          text: 'Our spring offer',
          messageThreadId,
        });

      await workspaceOrmManager
        .getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
          'messageChannelMessageAssociation',
        )
        .insert({
          id: randomUUID(),
          messageId,
          messageChannelId,
          messageExternalId: providerMessageId,
          messageThreadExternalId: threadExternalId,
          direction: MessageDirection.OUTGOING,
        });

      return messageThreadId;
    });

  const importReply = async (rawReply: string) => {
    const receivedEmailId = randomUUID();
    const downloadUrl = `${RAW_EMAIL_DOWNLOAD_BASE_URL}/${receivedEmailId}`;

    httpMock.use(
      http.get(
        `https://api.resend.com/emails/receiving/${receivedEmailId}`,
        () =>
          HttpResponse.json({
            id: receivedEmailId,
            from: 'customer@external.test',
            to: [groupHandle],
            raw: { download_url: downloadUrl, expires_at: '2099-01-01' },
          }),
      ),
      http.get(downloadUrl, () => HttpResponse.text(rawReply)),
    );

    const outcome = await getAppProviderByClassName<InboundEmailImportService>(
      'InboundEmailImportService',
    ).importInboundMessage({
      messageReference: { source: 'RESEND', reference: receivedEmailId },
      envelopeRecipients: [groupHandle],
    });

    expect(outcome.kind).toBe('imported');
  };

  const findThreadIdOfMessage = (headerMessageId: string) =>
    inWorkspace(async (workspaceOrmManager) => {
      const message = await workspaceOrmManager
        .getRepository<MessageWorkspaceEntity>('message')
        .createQueryBuilder('message')
        .where('message.headerMessageId = :headerMessageId', {
          headerMessageId,
        })
        .getOne<MessageWorkspaceEntity>();

      return message?.messageThreadId;
    });

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

  it('joins the sent thread when the reply carries the Twenty token in References', async () => {
    const threadToken = `<${randomUUID()}@acme.com>`;
    const providerMessageId = buildSesProviderMessageId();
    const sentHeaderMessageId = `<${providerMessageId}@eu-central-1.amazonses.com>`;
    const replyHeaderMessageId = `<${randomUUID()}@outlook.test>`;

    const sentThreadId = await seedSentMessage({
      messageChannelId: groupChannelId,
      providerMessageId,
      threadExternalId: threadToken,
    });

    await importReply(
      buildRawReply({
        groupHandle,
        headerMessageId: replyHeaderMessageId,
        inReplyTo: sentHeaderMessageId,
        references: `${threadToken} ${sentHeaderMessageId}`,
      }),
    );

    expect(await findThreadIdOfMessage(replyHeaderMessageId)).toBe(
      sentThreadId,
    );
  }, 60000);

  it('joins the sent thread when the mail app dropped References and only kept an In-Reply-To whose part before @ is the provider id', async () => {
    const providerMessageId = buildSesProviderMessageId();
    const replyHeaderMessageId = `<${randomUUID()}@icloud.test>`;

    const sentThreadId = await seedSentMessage({
      messageChannelId: groupChannelId,
      providerMessageId,
      threadExternalId: `<${randomUUID()}@acme.com>`,
    });

    await importReply(
      buildRawReply({
        groupHandle,
        headerMessageId: replyHeaderMessageId,
        inReplyTo: `<${providerMessageId}@email.amazonses.com>`,
      }),
    );

    expect(await findThreadIdOfMessage(replyHeaderMessageId)).toBe(
      sentThreadId,
    );
  }, 60000);

  it('starts a new thread when the referenced thread belongs to another channel', async () => {
    const threadToken = `<${randomUUID()}@acme.com>`;
    const replyHeaderMessageId = `<${randomUUID()}@gmail.test>`;

    const otherChannelThreadId = await seedSentMessage({
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.SUPPORT_GROUP,
      providerMessageId: buildSesProviderMessageId(),
      threadExternalId: threadToken,
    });

    await importReply(
      buildRawReply({
        groupHandle,
        headerMessageId: replyHeaderMessageId,
        references: threadToken,
      }),
    );

    expect(await findThreadIdOfMessage(replyHeaderMessageId)).not.toBe(
      otherChannelThreadId,
    );
  }, 60000);
});
