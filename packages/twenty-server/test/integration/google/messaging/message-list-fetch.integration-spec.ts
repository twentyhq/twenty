import { ConnectedAccountProvider } from 'twenty-shared/types';

import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { queryMessageFolders } from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'gmail-message-list-fetch@apple.dev';

describe('Gmail message list fetch (integration)', () => {
  const inbox = [gmailMessage(), gmailMessage()];

  setupGoogleMock({ handle: HANDLE, inbox });

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

  it('runs the full sync pipeline on the real worker: folders synced, messages imported', async () => {
    await runMessageChannelSync(channel.channelId);

    const expectedSubjects = inbox.map(getGmailMessageSubject);

    expect(await findImportedMessageSubjects(expectedSubjects)).toEqual(
      [...expectedSubjects].sort(),
    );

    const folders = await queryMessageFolders(channel.channelId);

    expect(folders.map((folder) => folder.name).sort()).toEqual([
      'INBOX',
      'SENT',
    ]);
  }, 60000);
});
