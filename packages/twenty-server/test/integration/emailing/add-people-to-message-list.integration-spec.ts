import gql from 'graphql-tag';
import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type AddPeopleToMessageListService } from 'src/modules/emailing/services/add-people-to-message-list.service';

const people = Array.from({ length: 1005 }, (_, index) => ({
  id: v4(),
  name: { firstName: `List ${index}`, lastName: v4() },
}));
const personIds = people.map(({ id }) => id);
const messageListIds: string[] = [];

const triggerAddPeopleToMessageListJob = (input: {
  messageListId: string;
  personFilter: object;
}) =>
  makeMetadataApiRequest({
    query: gql`
      mutation TriggerAddPeopleToMessageListJob(
        $input: TriggerAddPeopleToMessageListJobInput!
      ) {
        triggerAddPeopleToMessageListJob(input: $input) {
          jobId
        }
      }
    `,
    variables: { input },
  });

const findAddPeopleToMessageListJobStatus = (messageListId: string) =>
  makeMetadataApiRequest({
    query: gql`
      query FindAddPeopleToMessageListJobStatus($messageListId: UUID!) {
        findAddPeopleToMessageListJobStatus(messageListId: $messageListId) {
          jobId
          state
        }
      }
    `,
    variables: { messageListId },
  });

const getJobState = async (jobId: string) => {
  const campaignQueue = global.app.get<MessageQueueService>(
    getQueueToken(MessageQueue.campaignQueue),
    { strict: false },
  );

  return (await campaignQueue.getJobs([jobId]))[jobId]?.state;
};

const waitForJobToSettle = async (jobId: string) => {
  await expectEventually(
    async () =>
      expect(['completed', 'failed']).toContain(await getJobState(jobId)),
    { timeoutMs: 90_000 },
  );

  return getJobState(jobId);
};

const addPeopleAndWait = async (input: {
  messageListId: string;
  personFilter: object;
}) => {
  const response = await triggerAddPeopleToMessageListJob(input);

  expect(response.body.errors).toBeUndefined();

  const jobId: string =
    response.body.data.triggerAddPeopleToMessageListJob.jobId;

  return waitForJobToSettle(jobId);
};

const createMessageList = async () => {
  const result = await createManyOperation({
    objectMetadataSingularName: 'messageList',
    objectMetadataPluralName: 'messageLists',
    data: [{ name: `Add people ${v4()}` }],
  });

  expect(result.errors).toBeUndefined();

  const messageListId: string = result.data.createdRecords[0].id;

  messageListIds.push(messageListId);

  return messageListId;
};

const countMessageListMembers = async (messageListId: string) => {
  const response = await makeGraphqlApiRequest({
    query: gql`
      query MessageListMembers($filter: MessageListMemberFilterInput) {
        messageListMembers(filter: $filter, first: 1) {
          totalCount
        }
      }
    `,
    variables: { filter: { listId: { eq: messageListId } } },
  });

  const totalCount: number = response.body.data.messageListMembers.totalCount;

  return totalCount;
};

const findMessageListMemberPersonIds = async (messageListId: string) => {
  const response = await makeGraphqlApiRequest({
    query: gql`
      query MessageListMembers($filter: MessageListMemberFilterInput) {
        messageListMembers(filter: $filter) {
          edges {
            node {
              personId
            }
          }
        }
      }
    `,
    variables: { filter: { listId: { eq: messageListId } } },
  });
  const edges: { node: { personId: string } }[] =
    response.body.data.messageListMembers.edges;

  return edges.map(({ node }) => node.personId).sort();
};

const destroyInBatches = async ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  field,
  values,
}: {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  field: string;
  values: string[];
}) => {
  for (let offset = 0; offset < values.length; offset += 100) {
    await makeGraphqlApiRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName,
        objectMetadataPluralName,
        gqlFields: 'id',
        filter: { [field]: { in: values.slice(offset, offset + 100) } },
      }),
    );
  }
};

describe('triggerAddPeopleToMessageListJob (integration)', () => {
  let wasMessageCampaignEnabled: boolean;

  beforeAll(async () => {
    wasMessageCampaignEnabled =
      await getAppProviderByClassName<FeatureFlagService>(
        'FeatureFlagService',
      ).isFeatureEnabled(
        FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
        SEED_APPLE_WORKSPACE_ID,
      );

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
      value: true,
      expectToFail: false,
    });

    for (let offset = 0; offset < people.length; offset += 100) {
      const result = await createManyOperation({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        data: people.slice(offset, offset + 100),
      });

      expect(result.errors).toBeUndefined();
    }
  }, 60_000);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    await destroyInBatches({
      objectMetadataSingularName: 'messageListMember',
      objectMetadataPluralName: 'messageListMembers',
      field: 'personId',
      values: personIds,
    });
    await destroyInBatches({
      objectMetadataSingularName: 'messageList',
      objectMetadataPluralName: 'messageLists',
      field: 'id',
      values: messageListIds,
    });
    await destroyInBatches({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      field: 'id',
      values: personIds,
    });
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED,
      value: wasMessageCampaignEnabled,
      expectToFail: false,
    });
  }, 60_000);

  it('adds every person matching the filter across pages, then skips people already on the list', async () => {
    const messageListId = await createMessageList();
    const personFilter = { id: { in: personIds } };

    expect(await addPeopleAndWait({ messageListId, personFilter })).toBe(
      'completed',
    );
    expect(await countMessageListMembers(messageListId)).toBe(people.length);

    expect(await addPeopleAndWait({ messageListId, personFilter })).toBe(
      'completed',
    );
    expect(await countMessageListMembers(messageListId)).toBe(people.length);
  }, 200_000);

  it('adds only the people matching the filter', async () => {
    const messageListId = await createMessageList();
    const selectedPersonIds = personIds.slice(0, 3);

    expect(
      await addPeopleAndWait({
        messageListId,
        personFilter: { id: { in: selectedPersonIds } },
      }),
    ).toBe('completed');
    expect(await findMessageListMemberPersonIds(messageListId)).toEqual(
      [...selectedPersonIds].sort(),
    );
  });

  it('rejects a list that does not exist', async () => {
    const response = await triggerAddPeopleToMessageListJob({
      messageListId: v4(),
      personFilter: { id: { in: personIds.slice(0, 1) } },
    });

    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].extensions.code).toBe('NOT_FOUND');
  });

  it('reports the running job and rejects a second add to the same list until it finishes', async () => {
    const messageListId = await createMessageList();
    const personFilter = { id: { in: personIds.slice(0, 3) } };
    const addPeopleToMessageListService =
      getAppProviderByClassName<AddPeopleToMessageListService>(
        'AddPeopleToMessageListService',
      );
    const addPeopleToMessageList =
      addPeopleToMessageListService.addPeopleToMessageList.bind(
        addPeopleToMessageListService,
      );
    let releaseJob = () => {};
    const jobGate = new Promise<void>((resolve) => {
      releaseJob = resolve;
    });

    jest
      .spyOn(addPeopleToMessageListService, 'addPeopleToMessageList')
      .mockImplementation(async (data) => {
        await jobGate;

        return addPeopleToMessageList(data);
      });

    try {
      const firstResponse = await triggerAddPeopleToMessageListJob({
        messageListId,
        personFilter,
      });
      const jobId: string =
        firstResponse.body.data.triggerAddPeopleToMessageListJob.jobId;

      await expectEventually(async () =>
        expect(await getJobState(jobId)).toBe('active'),
      );

      const statusResponse =
        await findAddPeopleToMessageListJobStatus(messageListId);

      expect(
        statusResponse.body.data.findAddPeopleToMessageListJobStatus,
      ).toEqual({ jobId, state: 'ACTIVE' });

      const secondResponse = await triggerAddPeopleToMessageListJob({
        messageListId,
        personFilter,
      });

      expect(secondResponse.body.errors[0].extensions.code).toBe('CONFLICT');

      releaseJob();

      expect(await waitForJobToSettle(jobId)).toBe('completed');
      expect(
        (await findAddPeopleToMessageListJobStatus(messageListId)).body.data
          .findAddPeopleToMessageListJobStatus,
      ).toBeNull();
      expect(await countMessageListMembers(messageListId)).toBe(3);
    } finally {
      releaseJob();
    }
  }, 60_000);
});
