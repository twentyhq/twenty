import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
} from 'twenty-shared/types';

import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { queryMessageChannels } from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'gmail-onboarding-recent-messages-import@apple.dev';

const findChannel = async (channelId: string) => {
  const channels = await queryMessageChannels();

  return channels.find((channel) => channel.id === channelId);
};

describe('Gmail onboarding recent messages import (integration)', () => {
  const sentMessages = [
    gmailMessage({ labelIds: ['SENT'] }),
    gmailMessage({ labelIds: ['SENT'] }),
  ];
  const expectedSubjects = sentMessages.map(getGmailMessageSubject).sort();

  setupGoogleMock({ handle: HANDLE, inbox: sentMessages });

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

  it('imports the recent sent messages during connect, before any sync job runs', async () => {
    await expectEventually(
      async () => {
        expect(await findImportedMessageSubjects(expectedSubjects)).toEqual(
          expectedSubjects,
        );
      },
      { timeoutMs: 30_000 },
    );
  }, 60000);

  it('leaves the channel awaiting the full message list fetch', async () => {
    await expectEventually(
      async () => {
        expect((await findChannel(channel.channelId))?.syncStage).toEqual(
          MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
        );
      },
      { timeoutMs: 30_000 },
    );
  }, 60000);

  it('lets the full sync complete afterwards without duplicating the imported messages', async () => {
    await runMessageChannelSync(channel.channelId);

    expect(await findImportedMessageSubjects(expectedSubjects)).toEqual(
      expectedSubjects,
    );
  }, 60000);
});
