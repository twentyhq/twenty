import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
} from 'twenty-shared/types';

import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { queryMessageChannel } from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'messaging-interrupted-backfill@apple.dev';

describe('Messaging interrupted backfill (integration)', () => {
  const inbox = [gmailMessage(), gmailMessage()];
  const expectedSubjects = inbox.map(getGmailMessageSubject).sort();

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
});
