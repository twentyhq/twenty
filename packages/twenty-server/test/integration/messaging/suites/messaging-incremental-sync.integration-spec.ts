import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
} from 'twenty-shared/types';

import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import {
  getGmailMessageSubject,
  gmailHistoryHandler,
  gmailMessage,
  setupGmailMock,
} from 'test/integration/messaging/utils/gmail-message-mock.util';
import { queryMessageChannel } from 'test/integration/messaging/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-channel-sync.util';
import { pollUntil } from 'test/integration/utils/poll-until.util';

const HANDLE = 'messaging-incremental-sync@apple.dev';

const findImportedSubjects = async (subjects: string[]): Promise<string[]> => {
  const response = await makeGraphqlAPIRequest(
    findManyOperationFactory({
      objectMetadataSingularName: 'message',
      objectMetadataPluralName: 'messages',
      gqlFields: `id
        subject`,
      filter: { subject: { in: subjects } },
    }),
  );

  return response.body.data.messages.edges.map(
    (edge: { node: { subject: string } }) => edge.node.subject,
  );
};

describe('Messaging incremental sync (integration)', () => {
  const inbox = [gmailMessage()];

  const gmail = setupGmailMock({ inbox, handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const runSyncCycle = () => runMessageChannelSync(channel.channelId);

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel.cleanup();
  });

  it('imports the initial inbox through a full sync', async () => {
    await runSyncCycle();

    const initialSubject = getGmailMessageSubject(inbox[0]);

    expect(await findImportedSubjects([initialSubject])).toEqual([
      initialSubject,
    ]);
  }, 60000);

  it('imports a newly arrived message through the history-based incremental sync', async () => {
    await pollUntil(
      () => queryMessageChannel(channel.connectedAccountId, channel.channelId),
      (channelState) =>
        channelState.syncStage ===
        MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    );

    const newMessage = gmailMessage();

    inbox.push(newMessage);

    gmail.use(gmailHistoryHandler([newMessage]));

    await runSyncCycle();

    const newSubject = getGmailMessageSubject(newMessage);

    expect(await findImportedSubjects([newSubject])).toEqual([newSubject]);
  }, 60000);
});
