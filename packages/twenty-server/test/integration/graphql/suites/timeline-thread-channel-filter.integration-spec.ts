import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/message-channel-seed-ids.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const GET_TIMELINE_THREADS = gql`
  query GetTimelineThreadsFromObjectRecord(
    $objectNameSingular: String!
    $recordId: UUID!
    $page: Int!
    $pageSize: Int!
    $channel: TimelineThreadChannelFilterInput
  ) {
    getTimelineThreadsFromObjectRecord(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
      page: $page
      pageSize: $pageSize
      channel: $channel
    ) {
      totalNumberOfThreads
      timelineThreads {
        id
        channel {
          type
          provider
          applicationId
        }
      }
    }
  }
`;

const GET_TIMELINE_THREAD_CHANNELS = gql`
  query GetTimelineThreadChannelsFromObjectRecord(
    $objectNameSingular: String!
    $recordId: UUID!
  ) {
    getTimelineThreadChannelsFromObjectRecord(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
    ) {
      type
      provider
      applicationId
    }
  }
`;

const COMPANY_ID = '20202020-c4a1-4000-8000-000000000001';
const SYNCED_THREAD_ID = '20202020-c4a1-4000-8000-000000000002';
const SYNCED_MESSAGE_ID = '20202020-c4a1-4000-8000-000000000003';
const SYNCED_THREAD_TARGET_ID = '20202020-c4a1-4000-8000-000000000004';
const SYNCED_ASSOCIATION_ID = '20202020-c4a1-4000-8000-000000000005';
const MANUAL_THREAD_ID = '20202020-c4a1-4000-8000-000000000006';
const MANUAL_MESSAGE_ID = '20202020-c4a1-4000-8000-000000000007';
const MANUAL_THREAD_TARGET_ID = '20202020-c4a1-4000-8000-000000000008';
const SYNCED_PARTICIPANT_ID = '20202020-c4a1-4000-8000-000000000009';
const MANUAL_PARTICIPANT_ID = '20202020-c4a1-4000-8000-00000000000a';

const FIXTURES: { objectMetadataSingularName: string; id: string }[] = [
  {
    objectMetadataSingularName: 'messageParticipant',
    id: SYNCED_PARTICIPANT_ID,
  },
  {
    objectMetadataSingularName: 'messageParticipant',
    id: MANUAL_PARTICIPANT_ID,
  },
  {
    objectMetadataSingularName: 'messageThreadTarget',
    id: SYNCED_THREAD_TARGET_ID,
  },
  {
    objectMetadataSingularName: 'messageThreadTarget',
    id: MANUAL_THREAD_TARGET_ID,
  },
  { objectMetadataSingularName: 'message', id: SYNCED_MESSAGE_ID },
  { objectMetadataSingularName: 'message', id: MANUAL_MESSAGE_ID },
  { objectMetadataSingularName: 'messageThread', id: SYNCED_THREAD_ID },
  { objectMetadataSingularName: 'messageThread', id: MANUAL_THREAD_ID },
  { objectMetadataSingularName: 'company', id: COMPANY_ID },
];

const GOOGLE_EMAIL_CHANNEL = {
  type: 'EMAIL',
  provider: 'google',
  applicationId: null,
};

const createRecord = async (
  objectMetadataSingularName: string,
  data: object,
) => {
  const response = await makeGraphqlApiRequest(
    createOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

const requestThreads = (channel?: object, page = 1, pageSize = 1) =>
  makeGraphqlApiRequest({
    query: GET_TIMELINE_THREADS,
    variables: {
      objectNameSingular: 'company',
      recordId: COMPANY_ID,
      page,
      pageSize,
      channel,
    },
  });

describe('timeline thread channel filter (integration)', () => {
  beforeAll(async () => {
    await createRecord('company', {
      id: COMPANY_ID,
      name: 'Channel Filter Co',
    });

    for (const [threadId, messageId, targetId, participantId, receivedAt] of [
      [
        SYNCED_THREAD_ID,
        SYNCED_MESSAGE_ID,
        SYNCED_THREAD_TARGET_ID,
        SYNCED_PARTICIPANT_ID,
        0,
      ],
      [
        MANUAL_THREAD_ID,
        MANUAL_MESSAGE_ID,
        MANUAL_THREAD_TARGET_ID,
        MANUAL_PARTICIPANT_ID,
        60_000,
      ],
    ] as const) {
      await createRecord('messageThread', { id: threadId });
      await createRecord('message', {
        id: messageId,
        messageThreadId: threadId,
        subject: 'Channel filter thread',
        text: 'Channel filter body',
        receivedAt: new Date(Date.now() + receivedAt).toISOString(),
      });
      await createRecord('messageParticipant', {
        id: participantId,
        messageId,
        role: 'FROM',
        handle: 'channel.filter@example.com',
        displayName: 'Channel Filter',
      });
      await createRecord('messageThreadTarget', {
        id: targetId,
        messageThreadId: threadId,
        targetCompanyId: COMPANY_ID,
      });
    }

    await globalThis.testDataSource.query(
      `INSERT INTO "${WORKSPACE_SCHEMA}"."messageChannelMessageAssociation"
        (id, "messageId", "messageThreadId", "messageChannelId", "messageExternalId")
        VALUES ($1, $2, $3, $4, $5)`,
      [
        SYNCED_ASSOCIATION_ID,
        SYNCED_MESSAGE_ID,
        SYNCED_THREAD_ID,
        MESSAGE_CHANNEL_DATA_SEED_IDS.TIM,
        'channel-filter-external-id',
      ],
    );
  });

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."messageChannelMessageAssociation" WHERE id = $1`,
      [SYNCED_ASSOCIATION_ID],
    );

    for (const { objectMetadataSingularName, id } of FIXTURES) {
      await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName,
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }
  });

  it('lists only the channels the record conversations use', async () => {
    const response = await makeGraphqlApiRequest({
      query: GET_TIMELINE_THREAD_CHANNELS,
      variables: { objectNameSingular: 'company', recordId: COMPANY_ID },
    });

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.getTimelineThreadChannelsFromObjectRecord,
    ).toEqual([GOOGLE_EMAIL_CHANNEL]);
  });

  it('keeps every conversation without a channel filter', async () => {
    const response = await requestThreads(undefined, 1, 10);

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.getTimelineThreadsFromObjectRecord
        .totalNumberOfThreads,
    ).toBe(2);
  });

  it('counts and pages only the conversations of the selected channel', async () => {
    const response = await requestThreads(GOOGLE_EMAIL_CHANNEL);

    expect(response.body.errors).toBeUndefined();

    const { totalNumberOfThreads, timelineThreads } =
      response.body.data.getTimelineThreadsFromObjectRecord;

    expect(totalNumberOfThreads).toBe(1);
    expect(timelineThreads).toEqual([
      { id: SYNCED_THREAD_ID, channel: GOOGLE_EMAIL_CHANNEL },
    ]);

    const nextPageResponse = await requestThreads(GOOGLE_EMAIL_CHANNEL, 2);

    expect(
      nextPageResponse.body.data.getTimelineThreadsFromObjectRecord
        .timelineThreads,
    ).toEqual([]);
  });

  it('returns nothing for a channel no conversation uses', async () => {
    const response = await requestThreads({
      type: 'EMAIL',
      provider: 'microsoft',
      applicationId: null,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getTimelineThreadsFromObjectRecord).toEqual({
      totalNumberOfThreads: 0,
      timelineThreads: [],
    });
  });
});
