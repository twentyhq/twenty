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

const MESSAGE_THREAD_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const MESSAGE_THREAD_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const MESSAGE_THREAD_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const UPDATED_AT_1 = new Date('10/10/2024');
const UPDATED_AT_2 = new Date('10/20/2024');

const MESSAGE_THREAD_GQL_FIELDS = `
  id
  updatedAt
  createdAt
  deletedAt
  messages{
    edges{
      node{
        id
      }
    }
  }
`;

describe('messageThreads resolvers (integration)', () => {
  it('1. should create and return messageThreads', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'messageThread',
      objectMetadataPluralName: 'messageThreads',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      data: [
        {
          id: MESSAGE_THREAD_1_ID,
        },
        {
          id: MESSAGE_THREAD_2_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createMessageThreads).toHaveLength(2);

    response.body.data.createMessageThreads.forEach((messageThread) => {
      expect(messageThread).toHaveProperty('id');
      expect(messageThread).toHaveProperty('updatedAt');
      expect(messageThread).toHaveProperty('createdAt');
      expect(messageThread).toHaveProperty('deletedAt');
      expect(messageThread).toHaveProperty('messages');
    });
  });

  it('1b. should create and return one messageThread', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'messageThread',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      data: {
        id: MESSAGE_THREAD_3_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdMessageThread = response.body.data.createMessageThread;

    expect(createdMessageThread).toHaveProperty('id');
    expect(createdMessageThread).toHaveProperty('updatedAt');
    expect(createdMessageThread).toHaveProperty('createdAt');
    expect(createdMessageThread).toHaveProperty('deletedAt');
    expect(createdMessageThread).toHaveProperty('messages');
  });

  it('2. should find many messageThreads', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageThread',
      objectMetadataPluralName: 'messageThreads',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.messageThreads;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const messageThread = edges[0].node;

      expect(messageThread).toHaveProperty('id');
      expect(messageThread).toHaveProperty('updatedAt');
      expect(messageThread).toHaveProperty('createdAt');
      expect(messageThread).toHaveProperty('deletedAt');
      expect(messageThread).toHaveProperty('messages');
    }
  });

  it('2b. should find one messageThread', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageThread',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_THREAD_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const messageThread = response.body.data.messageThread;

    expect(messageThread).toHaveProperty('id');
    expect(messageThread).toHaveProperty('updatedAt');
    expect(messageThread).toHaveProperty('createdAt');
    expect(messageThread).toHaveProperty('deletedAt');
    expect(messageThread).toHaveProperty('messages');
  });

  it('3. should update many messageThreads', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'messageThread',
      objectMetadataPluralName: 'messageThreads',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      data: {
        updatedAt: UPDATED_AT_1,
      },
      filter: {
        id: {
          in: [MESSAGE_THREAD_1_ID, MESSAGE_THREAD_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedMessageThreads = response.body.data.updateMessageThreads;

    expect(updatedMessageThreads).toHaveLength(2);

    updatedMessageThreads.forEach((messageThread) => {
      expect(messageThread.updatedAt).toEqual(UPDATED_AT_1.toISOString());
    });
  });

  it('3b. should update one messageThread', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'messageThread',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      data: {
        updatedAt: UPDATED_AT_2,
      },
      recordId: MESSAGE_THREAD_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedMessageThread = response.body.data.updateMessageThread;

    expect(updatedMessageThread.updatedAt).toEqual(UPDATED_AT_2.toISOString());
  });

  it('4. should find many messageThreads with updated updatedAt', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageThread',
      objectMetadataPluralName: 'messageThreads',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      filter: {
        updatedAt: {
          eq: UPDATED_AT_1,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageThreads.edges).toHaveLength(2);
  });

  it('4b. should find one messageThread with updated updatedAt', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageThread',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      filter: {
        updatedAt: {
          eq: UPDATED_AT_2,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageThread.updatedAt).toEqual(
      UPDATED_AT_2.toISOString(),
    );
  });

  it('5. should delete many messageThreads', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'messageThread',
      objectMetadataPluralName: 'messageThreads',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_THREAD_1_ID, MESSAGE_THREAD_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteMessageThreads = response.body.data.deleteMessageThreads;

    expect(deleteMessageThreads).toHaveLength(2);

    deleteMessageThreads.forEach((messageThread) => {
      expect(messageThread.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one messageThread', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'messageThread',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      recordId: MESSAGE_THREAD_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteMessageThread.deletedAt).toBeTruthy();
  });

  it('6. should not find many messageThreads anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageThread',
      objectMetadataPluralName: 'messageThreads',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_THREAD_1_ID, MESSAGE_THREAD_2_ID],
        },
      },
    });

    const findMessageThreadsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      findMessageThreadsResponse.body.data.messageThreads.edges,
    ).toHaveLength(0);
  });

  it('6b. should not find one messageThread anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageThread',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_THREAD_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageThread).toBeNull();
  });

  it('7. should find many deleted messageThreads with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageThread',
      objectMetadataPluralName: 'messageThreads',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_THREAD_1_ID, MESSAGE_THREAD_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageThreads.edges).toHaveLength(2);
  });

  it('7b. should find one deleted messageThread with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageThread',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_THREAD_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageThread.id).toEqual(MESSAGE_THREAD_3_ID);
  });

  it('8. should destroy many messageThreads', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'messageThread',
      objectMetadataPluralName: 'messageThreads',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_THREAD_1_ID, MESSAGE_THREAD_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyMessageThreads).toHaveLength(2);
  });

  it('8b. should destroy one messageThread', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'messageThread',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      recordId: MESSAGE_THREAD_3_ID,
    });

    const destroyMessageThreadsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      destroyMessageThreadsResponse.body.data.destroyMessageThread,
    ).toBeTruthy();
  });

  it('9. should not find many messageThreads anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'messageThread',
      objectMetadataPluralName: 'messageThreads',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      filter: {
        id: {
          in: [MESSAGE_THREAD_1_ID, MESSAGE_THREAD_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageThreads.edges).toHaveLength(0);
  });

  it('9b. should not find one messageThread anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'messageThread',
      gqlFields: MESSAGE_THREAD_GQL_FIELDS,
      filter: {
        id: {
          eq: MESSAGE_THREAD_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.messageThread).toBeNull();
  });
});
