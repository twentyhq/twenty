import { randomUUID } from 'node:crypto';

import {
  ConnectedAccountProvider,
  MessageChannelContactAutoCreationPolicy,
} from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'microsoft-deleted-message-timeline@apple.dev';
const KNOWN_SENDER = `known-sender-${randomUUID()}@acme.com`;

const FOLDERS = [{ id: 'inbox', displayName: 'Inbox' }];

const inboxMessage = (id: string) => ({
  id,
  subject: `Microsoft message ${randomUUID()}`,
  body: { contentType: 'text', content: 'body' },
  receivedDateTime: '2026-08-13T00:00:00.000Z',
  internetMessageId: `<${id}@example.com>`,
  conversationId: `${id}-conversation`,
  parentFolderId: 'inbox',
  isDraft: false,
  from: { emailAddress: { address: KNOWN_SENDER } },
  toRecipients: [{ emailAddress: { address: HANDLE } }],
});

const KEPT_MESSAGE = inboxMessage('microsoft-timeline-kept-message');
const DELETED_MESSAGE = inboxMessage('microsoft-timeline-deleted-message');

const findMessageId = async (headerMessageId: string) => {
  const [message] = await findRecordNodesByFilter<{ id: string }>(
    'message',
    'messages',
    'id',
    { headerMessageId: { eq: headerMessageId } },
  );

  return message.id;
};

const findLinkedRecordIdsOnTimeline = async (personId: string) => {
  const timelineActivities = await findRecordNodesByFilter<{
    linkedRecordId: string | null;
  }>('timelineActivity', 'timelineActivities', 'linkedRecordId', {
    targetPersonId: { eq: personId },
  });

  return timelineActivities.map(
    (timelineActivity) => timelineActivity.linkedRecordId,
  );
};

describe('Timeline when a synced email is deleted (integration)', () => {
  const microsoftMock = setupMicrosoftMock({
    handle: HANDLE,
    folders: FOLDERS,
    messages: [KEPT_MESSAGE, DELETED_MESSAGE],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let keptMessageId: string;
  let deletedMessageId: string;
  let linkedRecordIdsBeforeDelete: (string | null)[];
  let linkedRecordIdsAfterDelete: (string | null)[];

  beforeAll(async () => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: { emails: { primaryEmail: KNOWN_SENDER } },
      }),
    );

    const senderPersonId: string = response.body.data.createPerson.id;

    await waitForAllJobsToFinish();

    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });

    await getCoreRepository<MessageChannelEntity>(MessageChannelEntity).update(
      { id: channel.channelId },
      {
        isContactAutoCreationEnabled: false,
        contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy.NONE,
      },
    );

    await runMessageChannelSync(channel.channelId);
    await waitForAllJobsToFinish();

    keptMessageId = await findMessageId(KEPT_MESSAGE.internetMessageId);
    deletedMessageId = await findMessageId(DELETED_MESSAGE.internetMessageId);
    linkedRecordIdsBeforeDelete =
      await findLinkedRecordIdsOnTimeline(senderPersonId);

    microsoftMock.deleteMessage(DELETED_MESSAGE.id);

    await runMessageChannelSync(channel.channelId);
    await waitForAllJobsToFinish();

    linkedRecordIdsAfterDelete =
      await findLinkedRecordIdsOnTimeline(senderPersonId);
  }, 180000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('puts both emails on the sender timeline after the first sync', () => {
    expect(linkedRecordIdsBeforeDelete).toEqual(
      expect.arrayContaining([keptMessageId, deletedMessageId]),
    );
  });

  it('removes the deleted email from the timeline and keeps the other one', () => {
    expect(linkedRecordIdsAfterDelete).toContain(keptMessageId);
    expect(linkedRecordIdsAfterDelete).not.toContain(deletedMessageId);
  });
});
