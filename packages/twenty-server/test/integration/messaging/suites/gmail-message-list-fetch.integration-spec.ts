import { ConnectedAccountProvider } from 'twenty-shared/types';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import {
  getGmailMessageSubject,
  gmailMessage,
  setupGmailMock,
} from 'test/integration/messaging/utils/gmail-message-mock.util';
import { queryMessageFolders } from 'test/integration/messaging/utils/query-messaging.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { runMessageChannelSync } from 'test/integration/utils/run-channel-sync.util';

const HANDLE = 'gmail-message-list-fetch@apple.dev';

const findImportedSubjects = async (subjects: string[]): Promise<string[]> => {
  const messages = await findRecordNodesByFilter<{ subject: string }>(
    'message',
    'messages',
    'subject',
    { subject: { in: subjects } },
  );

  return messages.map((message) => message.subject).sort();
};

describe('Gmail message list fetch (integration)', () => {
  const inbox = [gmailMessage(), gmailMessage()];

  setupGmailMock({ inbox, handle: HANDLE });

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

    expect(await findImportedSubjects(expectedSubjects)).toEqual(
      [...expectedSubjects].sort(),
    );

    const folders = await queryMessageFolders(channel.channelId);

    expect(folders.map((folder) => folder.name).sort()).toEqual([
      'INBOX',
      'SENT',
    ]);
  }, 60000);
});
