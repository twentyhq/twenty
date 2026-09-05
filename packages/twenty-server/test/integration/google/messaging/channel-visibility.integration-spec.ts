import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import {
  ConnectedAccountProvider,
  FeatureFlagKey,
  MessageChannelVisibility,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'gmail-channel-visibility@apple.dev';
const SENDER_HANDLE = 'gmail-channel-visibility-sender@acme.com';

const RESTRICTED = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

type MakeRequest =
  | typeof makeGraphqlAPIRequest
  | typeof makeGraphqlAPIRequestWithMemberRole;

type TimelineThread = { id: string; subject: string; lastMessageBody: string };

const CREATE_MESSAGE_WITH_SHARE_WITH = gql`
  mutation CreateMessageWithShareWith(
    $data: MessageCreateInput!
    $shareWith: [ShareWithInput!]
  ) {
    createMessage(data: $data, shareWith: $shareWith) {
      id
    }
  }
`;

const GET_TIMELINE_THREADS_FROM_PERSON_ID = gql`
  query GetTimelineThreadsFromPersonId(
    $personId: UUID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineThreadsFromPersonId(
      personId: $personId
      page: $page
      pageSize: $pageSize
    ) {
      totalNumberOfThreads
      timelineThreads {
        id
        subject
        lastMessageBody
      }
    }
  }
`;

describe('Message channel visibility (integration)', () => {
  const inbox = [gmailMessage({ from: SENDER_HANDLE, to: HANDLE })];
  const subject = getGmailMessageSubject(inbox[0]);
  const ownerOnlySourceId = randomUUID();

  setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let senderPersonId: string;
  let messageId: string;
  let messageThreadId: string;
  let recordShareService: RecordShareService;
  let workspaceOrmManager: WorkspaceOrmManager;
  let objectMetadataIdByNameSingular: Record<string, string>;
  const apiMessageIds: string[] = [];

  const readMessagesAs = async (
    makeRequest: MakeRequest,
    subjectToRead = subject,
  ) => {
    const response = await makeRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'message',
        objectMetadataPluralName: 'messages',
        gqlFields: 'id subject text messageThreadId',
        filter: { subject: { eq: subjectToRead } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.messages.edges.map(
      (edge: {
        node: {
          id: string;
          subject: string;
          text: string;
          messageThreadId: string;
        };
      }) => edge.node,
    );
  };

  const readThreadIdsAs = async (makeRequest: MakeRequest) => {
    const response = await makeRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'messageThread',
        objectMetadataPluralName: 'messageThreads',
        gqlFields: 'id',
        filter: { id: { eq: messageThreadId } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.messageThreads.edges.map(
      (edge: { node: { id: string } }) => edge.node.id,
    );
  };

  const updateMessageIsDraftAs = async (
    makeRequest: MakeRequest,
    isDraft: boolean,
  ) => {
    const response = await makeRequest(
      updateManyOperationFactory({
        objectMetadataSingularName: 'message',
        objectMetadataPluralName: 'messages',
        gqlFields: 'id',
        data: { isDraft },
        filter: { id: { eq: messageId } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.updateMessages.map(
      (message: { id: string }) => message.id,
    );
  };

  const readTimelineAs = async (makeRequest: MakeRequest) => {
    const response = await makeRequest({
      query: GET_TIMELINE_THREADS_FROM_PERSON_ID,
      variables: { personId: senderPersonId, page: 1, pageSize: 10 },
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.getTimelineThreadsFromPersonId as {
      totalNumberOfThreads: number;
      timelineThreads: TimelineThread[];
    };
  };

  const createApiMessageAs = async (
    makeRequest: MakeRequest,
    messageSubject: string,
    shareWith?: { everyone: boolean; accessLevel: RecordShareAccessLevel }[],
  ) => {
    const response = await makeRequest({
      query: CREATE_MESSAGE_WITH_SHARE_WITH,
      variables: {
        data: { subject: messageSubject, text: `${messageSubject} body` },
        shareWith,
      },
    });

    expect(response.body.errors).toBeUndefined();
    apiMessageIds.push(response.body.data.createMessage.id);

    return response.body.data.createMessage.id as string;
  };

  const deleteRecordShares = (recordShares: RecordShare[]) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () =>
        workspaceOrmManager
          .getRepository<RecordShare>('recordShare', {
            shouldBypassPermissionChecks: true,
          })
          .delete(recordShares.map((recordShare) => recordShare.id)),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const setVisibility = async (visibility: MessageChannelVisibility) => {
    await getCoreRepository<MessageChannelEntity>(MessageChannelEntity).update(
      { id: channel.channelId },
      { visibility },
    );
  };

  const setRecordSharingEnabled = (value: boolean) =>
    updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
      value,
      expectToFail: false,
    });

  beforeAll(async () => {
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    const objectMetadataItems = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).find({ where: { workspaceId: SEED_APPLE_WORKSPACE_ID } });

    objectMetadataIdByNameSingular = Object.fromEntries(
      objectMetadataItems.map((objectMetadata) => [
        objectMetadata.nameSingular,
        objectMetadata.id,
      ]),
    );

    const createPersonResponse = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: { emails: { primaryEmail: SENDER_HANDLE } },
      }),
    );

    expect(createPersonResponse.body.errors).toBeUndefined();
    senderPersonId = createPersonResponse.body.data.createPerson.id;

    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);
    await waitForAllJobsToFinish();

    const [message] = await findRecordNodesByFilter<{
      id: string;
      messageThreadId: string;
    }>('message', 'messages', 'id messageThreadId', {
      subject: { eq: subject },
    });

    messageId = message.id;
    messageThreadId = message.messageThreadId;
  }, 120000);

  afterAll(async () => {
    await setRecordSharingEnabled(false);
    await recordShareService
      .deleteBySourceId({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        sourceId: ownerOnlySourceId,
      })
      .catch(() => undefined);
    await channel?.cleanup().catch(() => undefined);
    for (const [objectMetadataSingularName, recordId] of [
      ...apiMessageIds.map((messageId) => ['message', messageId]),
      ['person', senderPersonId],
    ]) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName,
          gqlFields: 'id',
          recordId,
        }),
      ).catch(() => undefined);
    }
  });

  it('shows the full message to another member when the channel shares everything', async () => {
    await setVisibility(MessageChannelVisibility.SHARE_EVERYTHING);

    const [message] = await readMessagesAs(makeGraphqlAPIRequestWithMemberRole);

    expect(message.subject).toBe(subject);
    expect(message.text).not.toBe(RESTRICTED);
  }, 60000);

  it('masks the body but keeps the subject for another member under subject visibility', async () => {
    await setVisibility(MessageChannelVisibility.SUBJECT);

    const [message] = await readMessagesAs(makeGraphqlAPIRequestWithMemberRole);

    expect(message.subject).toBe(subject);
    expect(message.text).toBe(RESTRICTED);
  }, 60000);

  it('masks both the subject and the body for another member under metadata visibility', async () => {
    await setVisibility(MessageChannelVisibility.METADATA);

    const [message] = await readMessagesAs(makeGraphqlAPIRequestWithMemberRole);

    expect(message.subject).toBe(RESTRICTED);
    expect(message.text).toBe(RESTRICTED);
  }, 60000);

  it('always shows the full message to the owner of the connected account', async () => {
    await setVisibility(MessageChannelVisibility.METADATA);

    const [message] = await readMessagesAs(makeGraphqlAPIRequest);

    expect(message.subject).toBe(subject);
    expect(message.text).not.toBe(RESTRICTED);
  }, 60000);

  describe('with record sharing enabled', () => {
    beforeAll(async () => {
      await setVisibility(MessageChannelVisibility.METADATA);
      await setRecordSharingEnabled(true);
    });

    afterAll(async () => {
      await setRecordSharingEnabled(false);
    });

    it('shows the thread and its masked message to another member through the everyone READ row', async () => {
      const messages = await readMessagesAs(
        makeGraphqlAPIRequestWithMemberRole,
      );

      expect(messages).toHaveLength(1);
      expect(messages[0].subject).toBe(RESTRICTED);
      expect(messages[0].text).toBe(RESTRICTED);
      expect(
        await readThreadIdsAs(makeGraphqlAPIRequestWithMemberRole),
      ).toEqual([messageThreadId]);
    }, 60000);

    it('keeps the subject but masks the body for another member under subject visibility', async () => {
      await setVisibility(MessageChannelVisibility.SUBJECT);

      const [message] = await readMessagesAs(
        makeGraphqlAPIRequestWithMemberRole,
      );

      expect(message.subject).toBe(subject);
      expect(message.text).toBe(RESTRICTED);

      await setVisibility(MessageChannelVisibility.METADATA);
    }, 60000);

    it('gates a message created through the API on its rows without splicing it for anyone', async () => {
      const ownerOnlySubject = `API message ${randomUUID()}`;
      const ownerOnlyMessageId = await createApiMessageAs(
        makeGraphqlAPIRequest,
        ownerOnlySubject,
      );

      expect(
        await readMessagesAs(
          makeGraphqlAPIRequestWithMemberRole,
          ownerOnlySubject,
        ),
      ).toEqual([]);
      expect(
        await readMessagesAs(makeGraphqlAPIRequest, ownerOnlySubject),
      ).toEqual([expect.objectContaining({ id: ownerOnlyMessageId })]);

      await deleteRecordShares(
        await recordShareService.findByRecord({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          objectMetadataId: objectMetadataIdByNameSingular.message,
          recordId: ownerOnlyMessageId,
        }),
      );

      expect(
        await readMessagesAs(makeGraphqlAPIRequest, ownerOnlySubject),
      ).toEqual([]);

      const sharedSubject = `API shared message ${randomUUID()}`;
      const sharedMessageId = await createApiMessageAs(
        makeGraphqlAPIRequest,
        sharedSubject,
        [{ everyone: true, accessLevel: RecordShareAccessLevel.READ }],
      );

      expect(
        await readMessagesAs(
          makeGraphqlAPIRequestWithMemberRole,
          sharedSubject,
        ),
      ).toEqual([
        expect.objectContaining({
          id: sharedMessageId,
          subject: sharedSubject,
        }),
      ]);
    }, 60000);

    it('lets the owner update the message but not another member', async () => {
      expect(
        await updateMessageIsDraftAs(makeGraphqlAPIRequestWithMemberRole, true),
      ).toEqual([]);
      expect(await updateMessageIsDraftAs(makeGraphqlAPIRequest, true)).toEqual(
        [messageId],
      );
      expect(
        await updateMessageIsDraftAs(makeGraphqlAPIRequest, false),
      ).toEqual([messageId]);
    }, 60000);

    it('gates the person timeline of another member on the everyone READ row', async () => {
      const memberTimeline = await readTimelineAs(
        makeGraphqlAPIRequestWithMemberRole,
      );

      expect(memberTimeline.totalNumberOfThreads).toBe(1);
      expect(memberTimeline.timelineThreads).toEqual([
        expect.objectContaining({
          id: messageThreadId,
          subject: RESTRICTED,
          lastMessageBody: RESTRICTED,
        }),
      ]);

      const ownerTimeline = await readTimelineAs(makeGraphqlAPIRequest);

      expect(ownerTimeline.totalNumberOfThreads).toBe(1);
      expect(ownerTimeline.timelineThreads[0].subject).toBe(subject);
    }, 60000);

    it('hides the thread and message from another member once the channel rows are gone while an owner FULL row keeps them for the owner', async () => {
      await recordShareService.deleteBySourceId({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        sourceId: channel.channelId,
      });
      await recordShareService.insertMany({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        recordShares: [
          {
            recordId: messageId,
            objectMetadataId: objectMetadataIdByNameSingular.message,
          },
          {
            recordId: messageThreadId,
            objectMetadataId: objectMetadataIdByNameSingular.messageThread,
          },
        ].map((record) => ({
          ...record,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.APPLICATION,
          sourceId: ownerOnlySourceId,
        })),
      });

      expect(await readMessagesAs(makeGraphqlAPIRequestWithMemberRole)).toEqual(
        [],
      );
      expect(
        await readThreadIdsAs(makeGraphqlAPIRequestWithMemberRole),
      ).toEqual([]);
      expect(
        (await readTimelineAs(makeGraphqlAPIRequestWithMemberRole))
          .totalNumberOfThreads,
      ).toBe(0);

      const [ownerMessage] = await readMessagesAs(makeGraphqlAPIRequest);

      expect(ownerMessage.subject).toBe(subject);
      expect(await readThreadIdsAs(makeGraphqlAPIRequest)).toEqual([
        messageThreadId,
      ]);
      expect(
        (await readTimelineAs(makeGraphqlAPIRequest)).totalNumberOfThreads,
      ).toBe(1);
    }, 60000);
  });
});
