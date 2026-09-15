import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';

import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { queryMessageChannel } from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'messaging-interrupted-backfill@apple.dev';

const UNMAPPED_FAILURE = {
  status: 400,
  reason: 'invalidArgument',
  message: 'Invalid message',
};

describe('Messaging interrupted backfill (integration)', () => {
  const inbox = [gmailMessage(), gmailMessage()];
  const expectedSubjects = inbox.map(getGmailMessageSubject).sort();

  const onceFailingMessage = gmailMessage();
  const onceFailingSubject = getGmailMessageSubject(onceFailingMessage);
  const alwaysFailingMessage = gmailMessage();
  const alwaysFailingSubject = getGmailMessageSubject(alwaysFailingMessage);

  const gmail = setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('keeps the listed messages pending when fetching them is rate limited', async () => {
    gmail.failMessageFetch({
      status: 403,
      reason: 'rateLimitExceeded',
      message: 'Rate Limit Exceeded',
    });

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStage).toBe(
      MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
    );
    expect(await findImportedMessageSubjects(expectedSubjects)).toEqual([]);
  }, 60000);

  it('imports the pending messages when the channel goes back through a list fetch past the advanced cursor', async () => {
    await runMessageChannelSync(channel.channelId);

    expect(await findImportedMessageSubjects(expectedSubjects)).toEqual(
      expectedSubjects,
    );
  }, 60000);

  it('fails the channel when importing a message breaks', async () => {
    inbox.push(onceFailingMessage);
    gmail.serveHistory([onceFailingMessage]);
    gmail.failMessageFetch(UNMAPPED_FAILURE);

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
  }, 60000);

  it('imports the message that failed the channel once on the next sync', async () => {
    await runMessageChannelSync(channel.channelId);

    expect(await findImportedMessageSubjects([onceFailingSubject])).toEqual([
      onceFailingSubject,
    ]);
  }, 60000);

  it('fails the channel twice in a row on a message that cannot be imported', async () => {
    inbox.push(alwaysFailingMessage);
    gmail.serveHistory([alwaysFailingMessage]);
    gmail.failMessageFetch(UNMAPPED_FAILURE);

    await runMessageChannelSync(channel.channelId);
    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
  }, 60000);

  it('stops retrying the message that failed the channel twice in a row and completes the next sync', async () => {
    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStage).toBe(
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    );
    expect(channelState.syncStatus).toBe(MessageChannelSyncStatus.ACTIVE);
    expect(await findImportedMessageSubjects([alwaysFailingSubject])).toEqual(
      [],
    );
  }, 60000);
});
