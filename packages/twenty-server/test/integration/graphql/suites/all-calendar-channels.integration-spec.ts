import { TIM_ACCOUNT_ID } from 'test/integration/graphql/integration.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

const CALENDAR_CHANNEL_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const CALENDAR_CHANNEL_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const CALENDAR_CHANNEL_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const CONNECTED_ACCOUNT_ID = '777a8457-eb2d-40ac-a707-441b615b6989';

const CALENDAR_CHANNEL_GQL_FIELDS = `
    id
    handle
    syncStatus
    syncStage
    visibility
    isContactAutoCreationEnabled
    contactAutoCreationPolicy
    isSyncEnabled
    syncCursor
    syncStageStartedAt
    throttleFailureCount
    createdAt
    updatedAt
    deletedAt
    connectedAccountId
`;

describe('calendarChannels resolvers (integration)', () => {
  beforeAll(async () => {
    const connectedAccountHandle = generateRecordName(CONNECTED_ACCOUNT_ID);
    const createConnectedAccountgraphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: `id`,
      data: {
        id: CONNECTED_ACCOUNT_ID,
        accountOwnerId: TIM_ACCOUNT_ID,
        handle: connectedAccountHandle,
      },
    });

    await makeGraphqlAPIRequest(createConnectedAccountgraphqlOperation);
  });

  afterAll(async () => {
    const destroyConnectedAccountGraphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: `id`,
      recordId: CONNECTED_ACCOUNT_ID,
    });

    await makeGraphqlAPIRequest(destroyConnectedAccountGraphqlOperation);
  });

  it('1. should create and return calendarChannels', async () => {
    const calendarChannelHandle1 = generateRecordName(CALENDAR_CHANNEL_1_ID);
    const calendarChannelHandle2 = generateRecordName(CALENDAR_CHANNEL_2_ID);

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      objectMetadataPluralName: 'calendarChannels',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      data: [
        {
          id: CALENDAR_CHANNEL_1_ID,
          handle: calendarChannelHandle1,
          connectedAccountId: CONNECTED_ACCOUNT_ID,
        },
        {
          id: CALENDAR_CHANNEL_2_ID,
          handle: calendarChannelHandle2,
          connectedAccountId: CONNECTED_ACCOUNT_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createCalendarChannels).toHaveLength(2);

    response.body.data.createCalendarChannels.forEach((calendarChannel) => {
      expect(calendarChannel).toHaveProperty('handle');
      expect([calendarChannelHandle1, calendarChannelHandle2]).toContain(
        calendarChannel.handle,
      );
      expect(calendarChannel).toHaveProperty('id');
      expect(calendarChannel).toHaveProperty('syncStatus');
      expect(calendarChannel).toHaveProperty('syncStage');
      expect(calendarChannel).toHaveProperty('visibility');
      expect(calendarChannel).toHaveProperty('isContactAutoCreationEnabled');
      expect(calendarChannel).toHaveProperty('contactAutoCreationPolicy');
      expect(calendarChannel).toHaveProperty('isSyncEnabled');
      expect(calendarChannel).toHaveProperty('syncCursor');
      expect(calendarChannel).toHaveProperty('syncStageStartedAt');
      expect(calendarChannel).toHaveProperty('throttleFailureCount');
      expect(calendarChannel).toHaveProperty('createdAt');
      expect(calendarChannel).toHaveProperty('updatedAt');
      expect(calendarChannel).toHaveProperty('deletedAt');
      expect(calendarChannel).toHaveProperty('connectedAccountId');
    });
  });

  it('1b. should create and return one calendarChannel', async () => {
    const calendarChannelHandle = generateRecordName(CALENDAR_CHANNEL_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      data: {
        id: CALENDAR_CHANNEL_3_ID,
        handle: calendarChannelHandle,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdCalendarChannel = response.body.data.createCalendarChannel;

    expect(createdCalendarChannel).toHaveProperty('handle');
    expect(createdCalendarChannel.handle).toEqual(calendarChannelHandle);
    expect(createdCalendarChannel).toHaveProperty('id');
    expect(createdCalendarChannel).toHaveProperty('syncStatus');
    expect(createdCalendarChannel).toHaveProperty('syncStage');
    expect(createdCalendarChannel).toHaveProperty('visibility');
    expect(createdCalendarChannel).toHaveProperty(
      'isContactAutoCreationEnabled',
    );
    expect(createdCalendarChannel).toHaveProperty('contactAutoCreationPolicy');
    expect(createdCalendarChannel).toHaveProperty('isSyncEnabled');
    expect(createdCalendarChannel).toHaveProperty('syncCursor');
    expect(createdCalendarChannel).toHaveProperty('syncStageStartedAt');
    expect(createdCalendarChannel).toHaveProperty('throttleFailureCount');
    expect(createdCalendarChannel).toHaveProperty('createdAt');
    expect(createdCalendarChannel).toHaveProperty('updatedAt');
    expect(createdCalendarChannel).toHaveProperty('deletedAt');
    expect(createdCalendarChannel).toHaveProperty('connectedAccountId');
  });

  it('2. should find many calendarChannels', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      objectMetadataPluralName: 'calendarChannels',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.calendarChannels;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    if (data.edges.length > 0) {
      const calendarChannels = data.edges[0].node;

      expect(calendarChannels).toHaveProperty('handle');
      expect(calendarChannels).toHaveProperty('syncStatus');
      expect(calendarChannels).toHaveProperty('syncStage');
      expect(calendarChannels).toHaveProperty('visibility');
      expect(calendarChannels).toHaveProperty('isContactAutoCreationEnabled');
      expect(calendarChannels).toHaveProperty('contactAutoCreationPolicy');
      expect(calendarChannels).toHaveProperty('isSyncEnabled');
      expect(calendarChannels).toHaveProperty('syncCursor');
      expect(calendarChannels).toHaveProperty('syncStageStartedAt');
      expect(calendarChannels).toHaveProperty('throttleFailureCount');
      expect(calendarChannels).toHaveProperty('id');
      expect(calendarChannels).toHaveProperty('createdAt');
      expect(calendarChannels).toHaveProperty('updatedAt');
      expect(calendarChannels).toHaveProperty('deletedAt');
      expect(calendarChannels).toHaveProperty('connectedAccountId');
    }
  });

  it('2b. should find one calendarChannel', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          eq: CALENDAR_CHANNEL_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const calendarChannel = response.body.data.calendarChannel;

    expect(calendarChannel).toHaveProperty('handle');
    expect(calendarChannel).toHaveProperty('syncStatus');
    expect(calendarChannel).toHaveProperty('syncStage');
    expect(calendarChannel).toHaveProperty('visibility');
    expect(calendarChannel).toHaveProperty('isContactAutoCreationEnabled');
    expect(calendarChannel).toHaveProperty('contactAutoCreationPolicy');
    expect(calendarChannel).toHaveProperty('isSyncEnabled');
    expect(calendarChannel).toHaveProperty('syncCursor');
    expect(calendarChannel).toHaveProperty('syncStageStartedAt');
    expect(calendarChannel).toHaveProperty('throttleFailureCount');
    expect(calendarChannel).toHaveProperty('id');
    expect(calendarChannel).toHaveProperty('createdAt');
    expect(calendarChannel).toHaveProperty('updatedAt');
    expect(calendarChannel).toHaveProperty('deletedAt');
    expect(calendarChannel).toHaveProperty('connectedAccountId');
  });

  it('3. should update many calendarChannels', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      objectMetadataPluralName: 'calendarChannels',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      data: {
        handle: 'Updated Handle',
      },
      filter: {
        id: {
          in: [CALENDAR_CHANNEL_1_ID, CALENDAR_CHANNEL_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedCalendarChannels = response.body.data.updateCalendarChannels;

    expect(updatedCalendarChannels).toHaveLength(2);

    updatedCalendarChannels.forEach((calendarChannel) => {
      expect(calendarChannel.handle).toEqual('Updated Handle');
    });
  });

  it('3b. should update one calendarChannel', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      data: {
        handle: 'New Handle',
      },
      recordId: CALENDAR_CHANNEL_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedCalendarChannel = response.body.data.updateCalendarChannel;

    expect(updatedCalendarChannel.handle).toEqual('New Handle');
  });

  it('4. should find many calendarChannels with updated handle', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      objectMetadataPluralName: 'calendarChannels',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      filter: {
        handle: {
          eq: 'Updated Handle',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarChannels.edges).toHaveLength(2);
  });

  it('4b. should find one calendarChannel with updated handle', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      filter: {
        handle: {
          eq: 'New Handle',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarChannel.handle).toEqual('New Handle');
  });

  it('5. should delete many calendarChannels', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      objectMetadataPluralName: 'calendarChannels',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          in: [CALENDAR_CHANNEL_1_ID, CALENDAR_CHANNEL_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deletedCalendarChannels = response.body.data.deleteCalendarChannels;

    expect(deletedCalendarChannels).toHaveLength(2);

    deletedCalendarChannels.forEach((calendarChannel) => {
      expect(calendarChannel.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one calendarChannel', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      recordId: CALENDAR_CHANNEL_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteCalendarChannel.deletedAt).toBeTruthy();
  });

  it('6. should not find many calendarChannels anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      objectMetadataPluralName: 'calendarChannels',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          in: [CALENDAR_CHANNEL_1_ID, CALENDAR_CHANNEL_2_ID],
        },
      },
    });

    const findCalendarChannelsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      findCalendarChannelsResponse.body.data.calendarChannels.edges,
    ).toHaveLength(0);
  });

  it('6b. should not find one calendarChannel anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          eq: CALENDAR_CHANNEL_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarChannel).toBeNull();
  });

  it('7. should find many deleted calendarChannels with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      objectMetadataPluralName: 'calendarChannels',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          in: [CALENDAR_CHANNEL_1_ID, CALENDAR_CHANNEL_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarChannels.edges).toHaveLength(2);
  });

  it('7b. should find one deleted calendarChannel with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          eq: CALENDAR_CHANNEL_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarChannel.id).toEqual(
      CALENDAR_CHANNEL_3_ID,
    );
  });

  it('8. should destroy many calendarChannels', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      objectMetadataPluralName: 'calendarChannels',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          in: [CALENDAR_CHANNEL_1_ID, CALENDAR_CHANNEL_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyCalendarChannels).toHaveLength(2);
  });

  it('8b. should destroy one calendarChannel', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      recordId: CALENDAR_CHANNEL_3_ID,
    });

    const destroyCalendarChannelResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      destroyCalendarChannelResponse.body.data.destroyCalendarChannel,
    ).toBeTruthy();
  });

  it('9. should not find many calendarChannels anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      objectMetadataPluralName: 'calendarChannels',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          in: [CALENDAR_CHANNEL_1_ID, CALENDAR_CHANNEL_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarChannels.edges).toHaveLength(0);
  });

  it('9b. should not find one calendarChannel anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'calendarChannel',
      gqlFields: CALENDAR_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          eq: CALENDAR_CHANNEL_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.calendarChannel).toBeNull();
  });
});
