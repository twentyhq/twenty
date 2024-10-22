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

const MESSAGE_CHANNEL_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const MESSAGE_CHANNEL_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const MESSAGE_CHANNEL_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const CONNECTED_ACCOUNT_ID = '777a8457-eb2d-40ac-a707-441b615b6989';

const MESSAGE_CHANNEL_GQL_FIELDS = `
    id
    handle
    deletedAt
    createdAt
    contactAutoCreationPolicy
    isContactAutoCreationEnabled
    isSyncEnabled
    syncCursor
    type
`;

describe('messageChannels resolvers (integration)', () => {
  beforeAll(async () => {
    const connectedAccountHandle = generateRecordName(CONNECTED_ACCOUNT_ID);
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: `id`,
      data: {
        id: CONNECTED_ACCOUNT_ID,
        accountOwnerId: TIM_ACCOUNT_ID,
        handle: connectedAccountHandle,
      },
    });

    await makeGraphqlAPIRequest(graphqlOperation);
  });

  afterAll(async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: `id`,
      recordId: CONNECTED_ACCOUNT_ID,
    });

    await makeGraphqlAPIRequest(graphqlOperation);
  });

  it('1. should create and return messageChannels', async () => {
    const messageChannelHandle1 = generateRecordName(MESSAGE_CHANNEL_1_ID);
    const messageChannelHandle2 = generateRecordName(MESSAGE_CHANNEL_2_ID);

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      objectMetadataPluralName: 'messageChannels',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      data: [
        {
          id: MESSAGE_CHANNEL_1_ID,
          handle: messageChannelHandle1,
          connectedAccountId: CONNECTED_ACCOUNT_ID,
        },
        {
          id: MESSAGE_CHANNEL_2_ID,
          handle: messageChannelHandle2,
          connectedAccountId: CONNECTED_ACCOUNT_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createMessageChannels).toHaveLength(2);

    response.body.data.createMessageChannels.forEach((messageChannel) => {
      expect(messageChannel).toHaveProperty('handle');
      expect([messageChannelHandle1, messageChannelHandle2]).toContain(
        messageChannel.handle,
      );

      expect(messageChannel).toHaveProperty('id');
      expect(messageChannel).toHaveProperty('deletedAt');
      expect(messageChannel).toHaveProperty('createdAt');
      expect(messageChannel).toHaveProperty('contactAutoCreationPolicy');
      expect(messageChannel).toHaveProperty('isContactAutoCreationEnabled');
      expect(messageChannel).toHaveProperty('isSyncEnabled');
      expect(messageChannel).toHaveProperty('syncCursor');
      expect(messageChannel).toHaveProperty('type');
    });
  });

  it('1b. should create and return one messageChannel', async () => {
    const messageChannelHandle = generateRecordName(MESSAGE_CHANNEL_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      data: {
        id: MESSAGE_CHANNEL_3_ID,
        handle: messageChannelHandle,
        connectedAccountId: CONNECTED_ACCOUNT_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdMessageChannel = response.body.data.createMessageChannel;

    expect(createdMessageChannel).toHaveProperty('handle');
    expect(createdMessageChannel.handle).toEqual(messageChannelHandle);

    expect(createdMessageChannel).toHaveProperty('id');
    expect(createdMessageChannel).toHaveProperty('deletedAt');
    expect(createdMessageChannel).toHaveProperty('createdAt');
    expect(createdMessageChannel).toHaveProperty('contactAutoCreationPolicy');
    expect(createdMessageChannel).toHaveProperty(
      'isContactAutoCreationEnabled',
    );
    expect(createdMessageChannel).toHaveProperty('isSyncEnabled');
    expect(createdMessageChannel).toHaveProperty('syncCursor');
    expect(createdMessageChannel).toHaveProperty('type');
  });

  it('2. should find many messageChannels', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      objectMetadataPluralName: 'messageChannels',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.messageChannels;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const messageChannel = edges[0].node;

      expect(messageChannel).toHaveProperty('handle');
      expect(messageChannel).toHaveProperty('id');
      expect(messageChannel).toHaveProperty('deletedAt');
      expect(messageChannel).toHaveProperty('createdAt');
      expect(messageChannel).toHaveProperty('contactAutoCreationPolicy');
      expect(messageChannel).toHaveProperty('isContactAutoCreationEnabled');
      expect(messageChannel).toHaveProperty('isSyncEnabled');
      expect(messageChannel).toHaveProperty('syncCursor');
      expect(messageChannel).toHaveProperty('type');
    }
  });

  it('2b. should find one messageChannel', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_CHANNEL_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const messageChannel = response.body.data.messageChannel;

    expect(messageChannel).toHaveProperty('handle');

    expect(messageChannel).toHaveProperty('id');
    expect(messageChannel).toHaveProperty('deletedAt');
    expect(messageChannel).toHaveProperty('createdAt');
    expect(messageChannel).toHaveProperty('contactAutoCreationPolicy');
    expect(messageChannel).toHaveProperty('isContactAutoCreationEnabled');
    expect(messageChannel).toHaveProperty('isSyncEnabled');
    expect(messageChannel).toHaveProperty('syncCursor');
    expect(messageChannel).toHaveProperty('type');
  });

  it('3. should update many messageChannels', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      objectMetadataPluralName: 'messageChannels',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      data: {
        handle: 'New Handle',
      },
      filter: {
        id: {
          in: [MESSAGE_CHANNEL_1_ID, MESSAGE_CHANNEL_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedMessageChannels = response.body.data.updateMessageChannels;

    expect(updatedMessageChannels).toHaveLength(2);

    updatedMessageChannels.forEach((messageChannel) => {
      expect(messageChannel.handle).toEqual('New Handle');
    });
  });

  it('3b. should update one messageChannel', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      data: {
        handle: 'Updated Handle',
      },
      recordId: MESSAGE_CHANNEL_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedMessageChannel = response.body.data.updateMessageChannel;

    expect(updatedMessageChannel.handle).toEqual('Updated Handle');
  });

  it('4. should find many messageChannels with updated handle', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      objectMetadataPluralName: 'messageChannels',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      filter: {
        handle: {
          eq: 'New Handle',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageChannels.edges).toHaveLength(2);
  });

  it('4b. should find one messageChannel with updated handle', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      filter: {
        handle: {
          eq: 'Updated Handle',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageChannel.handle).toEqual('Updated Handle');
  });

  it('5. should delete many messageChannels', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      objectMetadataPluralName: 'messageChannels',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_CHANNEL_1_ID, MESSAGE_CHANNEL_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteMessageChannels = response.body.data.deleteMessageChannels;

    expect(deleteMessageChannels).toHaveLength(2);

    deleteMessageChannels.forEach((messageChannel) => {
      expect(messageChannel.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one messageChannel', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      recordId: MESSAGE_CHANNEL_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteMessageChannel.deletedAt).toBeTruthy();
  });

  it('6. should not find many messageChannels anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      objectMetadataPluralName: 'messageChannels',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_CHANNEL_1_ID, MESSAGE_CHANNEL_2_ID],
        },
      },
    });

    const findMessageChannelsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      findMessageChannelsResponse.body.data.messageChannels.edges,
    ).toHaveLength(0);
  });

  it('6b. should not find one messageChannel anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_CHANNEL_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageChannel).toBeNull();
  });

  it('7. should find many deleted messageChannels with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      objectMetadataPluralName: 'messageChannels',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_CHANNEL_1_ID, MESSAGE_CHANNEL_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageChannels.edges).toHaveLength(2);
  });

  it('7b. should find one deleted messageChannel with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_CHANNEL_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageChannel.id).toEqual(MESSAGE_CHANNEL_3_ID);
  });

  it('8. should destroy many messageChannels', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      objectMetadataPluralName: 'messageChannels',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_CHANNEL_1_ID, MESSAGE_CHANNEL_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyMessageChannels).toHaveLength(2);
  });

  it('8b. should destroy one messageChannel', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      recordId: MESSAGE_CHANNEL_3_ID,
    });

    const destroyMessageChannelResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      destroyMessageChannelResponse.body.data.destroyMessageChannel,
    ).toBeTruthy();
  });

  it('9. should not find many messageChannels anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      objectMetadataPluralName: 'messageChannels',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_CHANNEL_1_ID, MESSAGE_CHANNEL_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageChannels.edges).toHaveLength(0);
  });

  it('9b. should not find one messageChannel anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageChannel',
      gqlFields: MESSAGE_CHANNEL_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_CHANNEL_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageChannel).toBeNull();
  });
});
