import { ConnectedAccountProvider } from 'twenty-shared/types';

import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import {
  getGmailMessageSubject,
  gmailMessage,
  setupGmailMock,
} from 'test/integration/messaging/utils/gmail-message-mock.util';
import { queryMessageFolders } from 'test/integration/messaging/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-channel-sync.util';
import { pollUntil } from 'test/integration/utils/poll-until.util';

const HANDLE = 'gmail-message-list-fetch@apple.dev';

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

  return response.body.data.messages.edges
    .map((edge: { node: { subject: string } }) => edge.node.subject)
    .sort();
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
    await channel.cleanup();
  });

  it('runs the full sync pipeline on the real worker: folders synced, messages imported', async () => {
    await runMessageChannelSync(channel.channelId);

    const expectedSubjects = inbox.map(getGmailMessageSubject);

    const importedSubjects = await pollUntil(
      () => findImportedSubjects(expectedSubjects),
      (subjects) => subjects.length === expectedSubjects.length,
    );

    expect(importedSubjects).toEqual([...expectedSubjects].sort());

    const folders = await queryMessageFolders(channel.channelId);

    expect(folders.map((folder) => folder.name).sort()).toEqual([
      'INBOX',
      'SENT',
    ]);
  }, 60000);
});
