import { ConnectedAccountProvider } from 'twenty-shared/types';

import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'messaging-incremental-sync@apple.dev';

describe('Messaging incremental sync (integration)', () => {
  const inbox = [gmailMessage()];

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

  it('imports the initial inbox through a full sync', async () => {
    await runMessageChannelSync(channel.channelId);

    const initialSubject = getGmailMessageSubject(inbox[0]);

    expect(await findImportedMessageSubjects([initialSubject])).toEqual([
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
    gmail.serveMessageList(initialMessages);
    gmail.serveHistory([newMessage]);

    await runMessageChannelSync(channel.channelId);

    const newSubject = getGmailMessageSubject(newMessage);

    expect(await findImportedMessageSubjects([newSubject])).toEqual([
      newSubject,
    ]);
  }, 60000);
});
