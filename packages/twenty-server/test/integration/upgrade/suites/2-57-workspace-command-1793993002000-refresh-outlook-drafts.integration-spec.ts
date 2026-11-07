import { randomUUID } from 'node:crypto';

import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
} from 'twenty-shared/types';

import { type RefreshOutlookDraftsCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1793993002000-refresh-outlook-drafts.command';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { MessagingMessagesImportJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-messages-import.job';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { enqueueJobAndDrain } from 'test/integration/utils/enqueue-job-and-drain.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { scheduleChannelStage } from 'test/integration/utils/schedule-channel-stage.util';

const HANDLE = 'microsoft-stuck-draft@apple.dev';

const buildDraft = (name: string) => ({
  id: `microsoft-${name}`,
  subject: `Microsoft ${name} ${randomUUID()}`,
  body: { contentType: 'text', content: 'Draft body' },
  receivedDateTime: '2026-08-13T00:00:00.000Z',
  internetMessageId: `<microsoft-${name}@example.com>`,
  conversationId: `microsoft-${name}-conversation`,
  parentFolderId: 'drafts',
  isDraft: true,
  from: { emailAddress: { address: HANDLE } },
  toRecipients: [{ emailAddress: { address: 'recipient@external.test' } }],
});

describe('2-57 workspace command - refresh Outlook drafts (integration)', () => {
  const sentDraft = buildDraft('stuck-sent-draft');
  const unsentDraft = buildDraft('unsent-draft');

  setupMicrosoftMock({
    handle: HANDLE,
    folders: [
      { id: 'inbox', displayName: 'Inbox' },
      { id: 'drafts', displayName: 'Drafts' },
      { id: 'sentitems', displayName: 'Sent Items' },
    ],
    messages: [sentDraft, unsentDraft],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    getAppProviderByClassName<RefreshOutlookDraftsCommand>(
      'RefreshOutlookDraftsCommand',
    ).runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const findChannelStage = async () =>
    (
      await getCoreRepository<MessageChannelEntity>(
        MessageChannelEntity,
      ).findOneByOrFail({ id: channel.channelId })
    ).syncStage;

  const setChannelStage = (syncStage: MessageChannelSyncStage) =>
    scheduleChannelStage(MessageChannelEntity, channel.channelId, syncStage);

  const findIsDraft = async (headerMessageId: string) => {
    const [message] = await findRecordNodesByFilter<{ isDraft: boolean }>(
      'message',
      'messages',
      'isDraft',
      { headerMessageId: { eq: headerMessageId } },
    );

    return message.isDraft;
  };

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);

    // Outlook sent it and the delta already went by: nothing will report this move again
    sentDraft.parentFolderId = 'sentitems';
    sentDraft.isDraft = false;
  }, 180000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('changes nothing in a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(await findChannelStage()).toBe(
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    );
  });

  it('leaves a channel that is already syncing alone', async () => {
    await setChannelStage(MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING);

    await runCommand();

    expect(await findChannelStage()).toBe(
      MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
    );

    await setChannelStage(MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING);
  });

  it('repairs the draft Outlook already sent and keeps the unsent one a draft', async () => {
    expect(await findIsDraft(sentDraft.internetMessageId)).toBe(true);

    await runCommand();

    expect(await findChannelStage()).toBe(
      MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
    );

    const workspaceId = await setChannelStage(
      MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
    );

    await enqueueJobAndDrain({
      queue: MessageQueue.messagingQueue,
      jobName: MessagingMessagesImportJob.name,
      data: { workspaceId, messageChannelId: channel.channelId },
      scope: { workspaceId, isWorkspaceJob: true },
    });

    expect(await findIsDraft(sentDraft.internetMessageId)).toBe(false);
    expect(await findIsDraft(unsentDraft.internetMessageId)).toBe(true);
    expect(await findChannelStage()).toBe(
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    );
  });
});
