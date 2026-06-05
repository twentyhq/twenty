import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import {
  type MessagingMessageListFetchJobData,
  MessagingMessageListFetchJob,
  type MessagingMessageListFetchJobResult,
} from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  getGmailMessageSubject,
  gmailMessage,
  setupGmailMock,
} from 'test/integration/messaging/utils/gmail-mock.util';
import { seedMessageChannel } from 'test/integration/messaging/utils/seed-message-channel.util';
import { enqueueJobAndAwait } from 'test/integration/utils/enqueue-job-and-await.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;

describe('Gmail message list fetch job (integration)', () => {
  const inbox = [gmailMessage(), gmailMessage()];

  setupGmailMock({ inbox, handle: 'tim@apple.dev' });

  let channel: Awaited<ReturnType<typeof seedMessageChannel>>;

  beforeAll(async () => {
    channel = await seedMessageChannel({ workspaceId: WORKSPACE_ID });
  }, 60000);

  afterAll(async () => {
    await channel.cleanup();
  });

  it('runs the full sync pipeline: folders synced, list fetched, messages imported', async () => {
    const result = await enqueueJobAndAwait<
      MessagingMessageListFetchJobData,
      MessagingMessageListFetchJobResult
    >(MessageQueue.messagingQueue, MessagingMessageListFetchJob, {
      messageChannelId: channel.channelId,
      workspaceId: WORKSPACE_ID,
    });

    const folders = await getCoreRepository<MessageFolderEntity>(
      MessageFolderEntity,
    ).find({
      where: { messageChannelId: channel.channelId },
    });

    const folderNames = folders.map((folder) => folder.name).sort();

    expect(folderNames).toEqual(['INBOX', 'SENT']);

    expect(result).toEqual({
      messagesToImport: inbox.length,
      messagesToDelete: 0,
    });

    const expectedSubjects = inbox.map(getGmailMessageSubject);

    const messagesResponse = await makeGraphqlAPIRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'message',
        objectMetadataPluralName: 'messages',
        gqlFields: `id
          subject`,
        filter: { subject: { in: expectedSubjects } },
      }),
    );

    const importedSubjects = messagesResponse.body.data.messages.edges
      .map((edge: { node: { subject: string } }) => edge.node.subject)
      .sort();

    expect(importedSubjects).toEqual([...expectedSubjects].sort());
  }, 60000);
});
