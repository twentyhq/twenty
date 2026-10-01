import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import {
  ConnectedAccountProvider,
  MessageChannelVisibility,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { updateMessageChannel } from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const JANE_HANDLE = 'gmail-channel-visibility-jane@apple.dev';
const JONY_HANDLE = 'gmail-channel-visibility-jony@apple.dev';
const SENDER_HANDLE = `sender-${randomUUID()}@acme.com`;

const RESTRICTED = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

type MakeRequest =
  | typeof makeGraphqlApiRequest
  | typeof makeGraphqlApiRequestWithMemberRole;

// Jane (admin) connects the account; Jony (member) is the other member.
describe('Message thread access from channel visibility (integration)', () => {
  const inbox = [gmailMessage({ from: SENDER_HANDLE })];
  const subject = getGmailMessageSubject(inbox[0]);

  const gmail = setupGoogleMock({ handle: JANE_HANDLE, inbox });

  let janeChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let jonyChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let senderPersonId: string;
  let messageId: string;
  let messageThreadId: string;

  const readMessages = async (makeRequest: MakeRequest) => {
    const response = await makeRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'message',
        objectMetadataPluralName: 'messages',
        gqlFields: 'id subject text',
        filter: { id: { eq: messageId } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.messages.edges.map(
      (edge: { node: { id: string; subject: string; text: string } }) =>
        edge.node,
    );
  };

  const discoverThreads = (makeRequest: MakeRequest, gqlFields: string) =>
    makeRequest({
      query: gql`
        query DiscoverMessageThreads($id: UUID) {
          messageThreads(discover: true, filter: { id: { eq: $id } }) {
            edges {
              node {
                ${gqlFields}
              }
            }
          }
        }
      `,
      variables: { id: messageThreadId },
    });

  const readTimeline = async (makeRequest: MakeRequest) => {
    const response = await makeRequest({
      query: gql`
        query GetTimelineThreadsFromObjectRecord($recordId: UUID!) {
          getTimelineThreadsFromObjectRecord(
            objectNameSingular: "person"
            recordId: $recordId
            page: 1
            pageSize: 10
          ) {
            totalNumberOfThreads
            timelineThreads {
              id
              subject
              lastMessageBody
              visibility
              numberOfMessagesInThread
            }
          }
        }
      `,
      variables: { recordId: senderPersonId },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.getTimelineThreadsFromObjectRecord;
  };

  const setJaneChannelVisibility = (visibility: MessageChannelVisibility) =>
    updateMessageChannel(janeChannel.channelId, { visibility });

  beforeAll(async () => {
    const personResponse = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: { emails: { primaryEmail: SENDER_HANDLE } },
      }),
    );

    expect(personResponse.body.errors).toBeUndefined();

    senderPersonId = personResponse.body.data.createPerson.id;

    janeChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: JANE_HANDLE,
    });

    await runMessageChannelSync(janeChannel.channelId);

    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'message',
        objectMetadataPluralName: 'messages',
        gqlFields: 'id messageThreadId',
        filter: { subject: { eq: subject } },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.messages.edges.length).toBeGreaterThan(0);

    messageId = response.body.data.messages.edges[0].node.id;
    messageThreadId = response.body.data.messages.edges[0].node.messageThreadId;
  }, 120000);

  afterAll(async () => {
    await janeChannel?.cleanup().catch(() => undefined);
    await jonyChannel?.cleanup().catch(() => undefined);

    if (isDefined(senderPersonId)) {
      await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: 'id',
          recordId: senderPersonId,
        }),
      ).catch(() => undefined);
    }
  });

  it('shows the message to another member when the channel shares everything', async () => {
    await setJaneChannelVisibility(MessageChannelVisibility.SHARE_EVERYTHING);

    const [message] = await readMessages(makeGraphqlApiRequestWithMemberRole);

    expect(message.subject).toBe(subject);
    expect(message.text).not.toBe(RESTRICTED);
  }, 60000);

  it.each([
    MessageChannelVisibility.METADATA,
    MessageChannelVisibility.SUBJECT,
  ])(
    'hides the message from another member under %s visibility',
    async (visibility) => {
      await setJaneChannelVisibility(visibility);

      expect(await readMessages(makeGraphqlApiRequestWithMemberRole)).toEqual(
        [],
      );
    },
    60000,
  );

  it('always shows the message to the member who synced it', async () => {
    await setJaneChannelVisibility(MessageChannelVisibility.METADATA);

    const [message] = await readMessages(makeGraphqlApiRequest);

    expect(message.subject).toBe(subject);
    expect(message.text).not.toBe(RESTRICTED);
  }, 60000);

  it('lets another member discover that the thread happened', async () => {
    await setJaneChannelVisibility(MessageChannelVisibility.METADATA);

    const response = await discoverThreads(
      makeGraphqlApiRequestWithMemberRole,
      'id messages { edges { node { id receivedAt } } }',
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.messageThreads.edges).toEqual([
      {
        node: {
          id: messageThreadId,
          messages: {
            edges: [
              { node: { id: messageId, receivedAt: expect.any(String) } },
            ],
          },
        },
      },
    ]);
  }, 60000);

  it('refuses to discover the subject of an unshared thread', async () => {
    await setJaneChannelVisibility(MessageChannelVisibility.METADATA);

    const response = await discoverThreads(
      makeGraphqlApiRequestWithMemberRole,
      'id messages { edges { node { subject } } }',
    );

    expect(response.body.errors?.[0]?.message).toContain('subject');
  }, 60000);

  it('shows an unshared thread on another member timeline without its content', async () => {
    await setJaneChannelVisibility(MessageChannelVisibility.METADATA);

    expect(await readTimeline(makeGraphqlApiRequestWithMemberRole)).toEqual({
      totalNumberOfThreads: 1,
      timelineThreads: [
        {
          id: messageThreadId,
          subject: RESTRICTED,
          lastMessageBody: RESTRICTED,
          visibility: MessageChannelVisibility.METADATA,
          numberOfMessagesInThread: 1,
        },
      ],
    });
  }, 60000);

  it('shows the content on the timeline once the channel shares everything', async () => {
    await setJaneChannelVisibility(MessageChannelVisibility.SHARE_EVERYTHING);

    const { timelineThreads } = await readTimeline(
      makeGraphqlApiRequestWithMemberRole,
    );

    expect(timelineThreads).toEqual([
      expect.objectContaining({
        id: messageThreadId,
        subject,
        visibility: MessageChannelVisibility.SHARE_EVERYTHING,
      }),
    ]);
  }, 60000);

  it('shows the message to every member who synced it', async () => {
    gmail.actAsAccount(JONY_HANDLE);

    jonyChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: JONY_HANDLE,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    await runMessageChannelSync(jonyChannel.channelId);

    await setJaneChannelVisibility(MessageChannelVisibility.METADATA);
    await updateMessageChannel(
      jonyChannel.channelId,
      { visibility: MessageChannelVisibility.METADATA },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    for (const makeRequest of [
      makeGraphqlApiRequest,
      makeGraphqlApiRequestWithMemberRole,
    ]) {
      const [message] = await readMessages(makeRequest);

      expect(message?.subject).toBe(subject);
    }
  }, 120000);
});
