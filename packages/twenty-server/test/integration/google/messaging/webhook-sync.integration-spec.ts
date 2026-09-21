import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
} from 'twenty-shared/types';

import { MESSAGING_MESSAGE_WEBHOOK_SYNC_INLINE_IMPORT_MAX_MESSAGES } from 'src/modules/connected-account-sync-webhooks/messaging-message-webhook-sync/constants/messaging-message-webhook-sync-inline-import-max-messages.constant';

import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { queryMessageChannel } from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { runMessageChannelWebhookSync } from 'test/integration/utils/run-message-channel-webhook-sync.util';

const HANDLE = 'messaging-webhook-sync@apple.dev';

describe('Messaging webhook sync (integration)', () => {
  const inbox = [gmailMessage()];

  const gmail = setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);
  }, 120000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('imports a new message in a single job without the list fetch cron', async () => {
    const newMessage = gmailMessage();

    inbox.push(newMessage);
    gmail.serveHistory([newMessage]);

    await runMessageChannelWebhookSync(channel.channelId);

    const newSubject = getGmailMessageSubject(newMessage);

    expect(await findImportedMessageSubjects([newSubject])).toEqual([
      newSubject,
    ]);
  }, 120000);

  it('leaves a delta larger than the inline cap to the import cron', async () => {
    const newMessages = Array.from(
      { length: MESSAGING_MESSAGE_WEBHOOK_SYNC_INLINE_IMPORT_MAX_MESSAGES + 1 },
      () => gmailMessage(),
    );

    inbox.push(...newMessages);
    gmail.serveHistory(newMessages);

    await runMessageChannelWebhookSync(channel.channelId);

    expect(
      await findImportedMessageSubjects(
        newMessages.map(getGmailMessageSubject),
      ),
    ).toEqual([]);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.syncStage).toBe(
      MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
    );
  }, 120000);

  it('does not sync when the channel is already being synced', async () => {
    const newMessage = gmailMessage();

    inbox.push(newMessage);
    gmail.serveHistory([newMessage]);

    await runMessageChannelWebhookSync(
      channel.channelId,
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
    );

    expect(
      await findImportedMessageSubjects([getGmailMessageSubject(newMessage)]),
    ).toEqual([]);
  }, 120000);
});
