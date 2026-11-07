import gql from 'graphql-tag';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

import { isDefined } from 'twenty-shared/utils';

import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/message-channel-seed-ids.constant';

const SEARCH_TIMELINE_THREADS = gql`
  query SearchTimelineThreads(
    $objectNameSingular: String!
    $recordId: UUID!
    $searchInput: String
  ) {
    searchTimelineThreads(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
      searchInput: $searchInput
    ) {
      recordTimelineThreads {
        id
        subject
      }
      otherTimelineThreads {
        id
        subject
      }
    }
  }
`;

const TEST_SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const COMPANY_ID = '20202020-5ea4-4000-8000-000000000001';
const COMPANY_THREAD_ID = '20202020-5ea4-4000-8000-000000000002';
const OTHER_THREAD_ID = '20202020-5ea4-4000-8000-000000000003';
const UNSHARED_COMPANY_THREAD_ID = '20202020-5ea4-4000-8000-000000000004';
const COLLEAGUE_THREAD_ID = '20202020-5ea4-4000-8000-000000000005';

const THREADS = [
  {
    messageThreadId: COMPANY_THREAD_ID,
    messageId: '20202020-5ea4-4000-8000-000000000012',
    participantId: '20202020-5ea4-4000-8000-000000000022',
    associationId: '20202020-5ea4-4000-8000-000000000032',
    targetId: '20202020-5ea4-4000-8000-000000000042',
    subject: 'Quillfeather renewal proposal',
    messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.TIM,
  },
  {
    messageThreadId: OTHER_THREAD_ID,
    messageId: '20202020-5ea4-4000-8000-000000000013',
    participantId: '20202020-5ea4-4000-8000-000000000023',
    associationId: '20202020-5ea4-4000-8000-000000000033',
    targetId: null,
    subject: 'Quillfeather kickoff notes',
    messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JANE,
  },
  {
    messageThreadId: UNSHARED_COMPANY_THREAD_ID,
    messageId: '20202020-5ea4-4000-8000-000000000014',
    participantId: '20202020-5ea4-4000-8000-000000000024',
    associationId: null,
    targetId: '20202020-5ea4-4000-8000-000000000044',
    subject: 'Quillfeather pricing without a channel',
    messageChannelId: null,
  },
  {
    messageThreadId: COLLEAGUE_THREAD_ID,
    messageId: '20202020-5ea4-4000-8000-000000000015',
    participantId: '20202020-5ea4-4000-8000-000000000025',
    associationId: '20202020-5ea4-4000-8000-000000000035',
    targetId: null,
    subject: 'Quillfeather offsite planning',
    messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.TIM,
  },
];

const createRecord = async ({
  objectMetadataSingularName,
  input,
}: {
  objectMetadataSingularName: string;
  input: object;
}) => {
  const { errors } = await createOneOperation({
    objectMetadataSingularName,
    input,
  });

  expect(errors).toBeUndefined();
};

const destroyRecord = (objectMetadataSingularName: string, recordId: string) =>
  makeGraphqlApiRequest(
    destroyOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      recordId,
    }),
  );

const searchTimelineThreads = async (searchInput?: string) => {
  const response = await makeGraphqlApiRequest({
    query: SEARCH_TIMELINE_THREADS,
    variables: {
      objectNameSingular: 'company',
      recordId: COMPANY_ID,
      searchInput,
    },
  });

  expect(response.body.errors).toBeUndefined();

  const { recordTimelineThreads, otherTimelineThreads } =
    response.body.data.searchTimelineThreads;

  return {
    recordThreadIds: recordTimelineThreads.map(({ id }: { id: string }) => id),
    otherThreadIds: otherTimelineThreads.map(({ id }: { id: string }) => id),
  };
};

describe('searchTimelineThreads (integration)', () => {
  beforeAll(async () => {
    await createRecord({
      objectMetadataSingularName: 'company',
      input: {
        id: COMPANY_ID,
        name: 'Quillfeather Search Company',
      },
    });

    for (const thread of THREADS) {
      await createRecord({
        objectMetadataSingularName: 'messageThread',
        input: {
          id: thread.messageThreadId,
          subject: thread.subject,
        },
      });

      await createRecord({
        objectMetadataSingularName: 'message',
        input: {
          id: thread.messageId,
          messageThreadId: thread.messageThreadId,
          subject: thread.subject,
          text: `${thread.subject} body`,
          receivedAt: new Date().toISOString(),
        },
      });

      await createRecord({
        objectMetadataSingularName: 'messageParticipant',
        input: {
          id: thread.participantId,
          messageId: thread.messageId,
          role: 'FROM',
          handle: 'quillfeather@example.com',
          displayName: 'Quillfeather Sender',
        },
      });

      // Channel associations are not writable through the API
      if (
        isDefined(thread.associationId) &&
        isDefined(thread.messageChannelId)
      ) {
        await global.testDataSource.query(
          `INSERT INTO "${TEST_SCHEMA_NAME}"."messageChannelMessageAssociation" ("id", "messageId", "messageChannelId", "messageExternalId", "messageThreadExternalId") VALUES ($1, $2, $3, $4, $5)`,
          [
            thread.associationId,
            thread.messageId,
            thread.messageChannelId,
            `quillfeather-${thread.messageId}`,
            `quillfeather-${thread.messageThreadId}`,
          ],
        );
      }

      if (isDefined(thread.targetId)) {
        await createRecord({
          objectMetadataSingularName: 'messageThreadTarget',
          input: {
            id: thread.targetId,
            messageThreadId: thread.messageThreadId,
            targetCompanyId: COMPANY_ID,
          },
        });
      }
    }
  });

  afterAll(async () => {
    for (const thread of THREADS) {
      if (isDefined(thread.targetId)) {
        await destroyRecord('messageThreadTarget', thread.targetId);
      }

      if (isDefined(thread.associationId)) {
        await deleteRecordsByIds('messageChannelMessageAssociation', [
          thread.associationId,
        ]);
      }

      await destroyRecord('messageParticipant', thread.participantId);
      await destroyRecord('message', thread.messageId);
      await destroyRecord('messageThread', thread.messageThreadId);
    }

    await destroyRecord('company', COMPANY_ID);
  });

  it('should list the record threads without fallback when there is no search input', async () => {
    const { recordThreadIds, otherThreadIds } = await searchTimelineThreads();

    expect(recordThreadIds).toEqual(
      expect.arrayContaining([COMPANY_THREAD_ID, UNSHARED_COMPANY_THREAD_ID]),
    );
    expect(otherThreadIds).toEqual([]);
  });

  it('should return matching record threads first and the viewer own matching threads as fallback', async () => {
    const { recordThreadIds, otherThreadIds } =
      await searchTimelineThreads('quillfeather');

    expect(recordThreadIds).toEqual([COMPANY_THREAD_ID]);
    expect(otherThreadIds).toEqual([OTHER_THREAD_ID]);
  });

  it('should not search colleagues mailboxes in the fallback', async () => {
    const { otherThreadIds } = await searchTimelineThreads(
      'quillfeather offsite',
    );

    expect(otherThreadIds).not.toContain(COLLEAGUE_THREAD_ID);
  });

  it('should not match threads whose subject is not shared through any channel', async () => {
    const { recordThreadIds, otherThreadIds } = await searchTimelineThreads(
      'quillfeather pricing',
    );

    expect(recordThreadIds).toEqual([]);
    expect(otherThreadIds).not.toContain(UNSHARED_COMPANY_THREAD_ID);
  });
});
