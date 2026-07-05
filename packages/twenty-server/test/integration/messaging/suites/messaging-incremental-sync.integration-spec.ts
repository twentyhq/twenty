import { ConnectedAccountProvider } from 'twenty-shared/types';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import {
  getGmailMessageSubject,
  gmailHistoryHandler,
  gmailMessage,
  gmailMessageListHandler,
  setupGmailMock,
} from 'test/integration/messaging/utils/gmail-message-mock.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { runMessageChannelSync } from 'test/integration/utils/run-channel-sync.util';

const HANDLE = 'messaging-incremental-sync@apple.dev';

const findImportedSubjects = async (subjects: string[]): Promise<string[]> => {
  const messages = await findRecordNodesByFilter<{ subject: string }>(
    'message',
    'messages',
    'subject',
    { subject: { in: subjects } },
  );

  return messages.map((message) => message.subject);
};

describe('Messaging incremental sync (integration)', () => {
  const inbox = [gmailMessage()];

  const gmail = setupGmailMock({ inbox, handle: HANDLE });

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

  it('imports the initial inbox through a full sync', async () => {
    await runMessageChannelSync(channel.channelId);

    const initialSubject = getGmailMessageSubject(inbox[0]);

    expect(await findImportedSubjects([initialSubject])).toEqual([
      initialSubject,
    ]);
  }, 60000);

  it('imports a newly arrived message through the history-based incremental sync', async () => {
    const initialMessages = [...inbox];
    const newMessage = gmailMessage();

    inbox.push(newMessage);

    // The list endpoint keeps serving only the initial inbox: the new message
    // is reachable through the history endpoint alone, so a regression that
    // re-runs a full list fetch instead of the history-based sync cannot pass.
    gmail.use(
      gmailMessageListHandler(initialMessages),
      gmailHistoryHandler([newMessage]),
    );

    await runMessageChannelSync(channel.channelId);

    const newSubject = getGmailMessageSubject(newMessage);

    expect(await findImportedSubjects([newSubject])).toEqual([newSubject]);
  }, 60000);
});
