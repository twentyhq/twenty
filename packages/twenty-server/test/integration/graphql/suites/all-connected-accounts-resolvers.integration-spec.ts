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

const CONNECTED_ACCOUNT_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const CONNECTED_ACCOUNT_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const CONNECTED_ACCOUNT_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const CONNECTED_ACCOUNT_GQL_FIELDS = `
    id
    handle
    deletedAt
    createdAt
    provider
    accessToken
    scopes
`;

describe('connectedAccounts resolvers (integration)', () => {
  it('1. should create and return connectedAccounts', async () => {
    const connectedAccountHandle1 = generateRecordName(CONNECTED_ACCOUNT_1_ID);
    const connectedAccountHandle2 = generateRecordName(CONNECTED_ACCOUNT_2_ID);

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      objectMetadataPluralName: 'connectedAccounts',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      data: [
        {
          id: CONNECTED_ACCOUNT_1_ID,
          handle: connectedAccountHandle1,
          accountOwnerId: TIM_ACCOUNT_ID,
        },
        {
          id: CONNECTED_ACCOUNT_2_ID,
          handle: connectedAccountHandle2,
          accountOwnerId: TIM_ACCOUNT_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createConnectedAccounts).toHaveLength(2);

    response.body.data.createConnectedAccounts.forEach((connectedAccount) => {
      expect(connectedAccount).toHaveProperty('handle');
      expect([connectedAccountHandle1, connectedAccountHandle2]).toContain(
        connectedAccount.handle,
      );

      expect(connectedAccount).toHaveProperty('id');
      expect(connectedAccount).toHaveProperty('deletedAt');
      expect(connectedAccount).toHaveProperty('createdAt');
      expect(connectedAccount).toHaveProperty('provider');
      expect(connectedAccount).toHaveProperty('accessToken');
      expect(connectedAccount).toHaveProperty('scopes');
    });
  });

  it('1b. should create and return one connectedAccount', async () => {
    const connectedAccountHandle = generateRecordName(CONNECTED_ACCOUNT_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      data: {
        id: CONNECTED_ACCOUNT_3_ID,
        handle: connectedAccountHandle,
        accountOwnerId: TIM_ACCOUNT_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdConnectedAccount = response.body.data.createConnectedAccount;

    expect(createdConnectedAccount).toHaveProperty('handle');
    expect(createdConnectedAccount.handle).toEqual(connectedAccountHandle);

    expect(createdConnectedAccount).toHaveProperty('id');
    expect(createdConnectedAccount).toHaveProperty('deletedAt');
    expect(createdConnectedAccount).toHaveProperty('createdAt');
    expect(createdConnectedAccount).toHaveProperty('provider');
    expect(createdConnectedAccount).toHaveProperty('accessToken');
    expect(createdConnectedAccount).toHaveProperty('scopes');
  });

  it('2. should find many connectedAccounts', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      objectMetadataPluralName: 'connectedAccounts',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.connectedAccounts;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const connectedAccounts = edges[0].node;

      expect(connectedAccounts).toHaveProperty('handle');
      expect(connectedAccounts).toHaveProperty('id');
      expect(connectedAccounts).toHaveProperty('deletedAt');
      expect(connectedAccounts).toHaveProperty('createdAt');
      expect(connectedAccounts).toHaveProperty('provider');
      expect(connectedAccounts).toHaveProperty('accessToken');
      expect(connectedAccounts).toHaveProperty('scopes');
    }
  });

  it('2b. should find one connectedAccount', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      filter: {
        id: {
          eq: CONNECTED_ACCOUNT_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const connectedAccount = response.body.data.connectedAccount;

    expect(connectedAccount).toHaveProperty('handle');

    expect(connectedAccount).toHaveProperty('id');
    expect(connectedAccount).toHaveProperty('deletedAt');
    expect(connectedAccount).toHaveProperty('createdAt');
    expect(connectedAccount).toHaveProperty('provider');
    expect(connectedAccount).toHaveProperty('accessToken');
    expect(connectedAccount).toHaveProperty('scopes');
  });

  it('3. should update many connectedAccounts', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      objectMetadataPluralName: 'connectedAccounts',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      data: {
        handle: 'New Handle',
      },
      filter: {
        id: {
          in: [CONNECTED_ACCOUNT_1_ID, CONNECTED_ACCOUNT_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedconnectedAccounts = response.body.data.updateConnectedAccounts;

    expect(updatedconnectedAccounts).toHaveLength(2);

    updatedconnectedAccounts.forEach((connectedAccount) => {
      expect(connectedAccount.handle).toEqual('New Handle');
    });
  });

  it('3b. should update one connectedAccount', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      data: {
        handle: 'Updated Handle',
      },
      recordId: CONNECTED_ACCOUNT_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedconnectedAccount = response.body.data.updateConnectedAccount;

    expect(updatedconnectedAccount.handle).toEqual('Updated Handle');
  });

  it('4. should find many connectedAccounts with updated handle', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      objectMetadataPluralName: 'connectedAccounts',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      filter: {
        handle: {
          eq: 'New Handle',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.connectedAccounts.edges).toHaveLength(2);
  });

  it('4b. should find one connectedAccount with updated handle', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      filter: {
        handle: {
          eq: 'Updated Handle',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.connectedAccount.handle).toEqual(
      'Updated Handle',
    );
  });

  it('5. should delete many connectedAccounts', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      objectMetadataPluralName: 'connectedAccounts',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      filter: {
        id: {
          in: [CONNECTED_ACCOUNT_1_ID, CONNECTED_ACCOUNT_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteConnectedAccounts = response.body.data.deleteConnectedAccounts;

    expect(deleteConnectedAccounts).toHaveLength(2);

    deleteConnectedAccounts.forEach((connectedAccount) => {
      expect(connectedAccount.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one connectedAccount', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      recordId: CONNECTED_ACCOUNT_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteConnectedAccount.deletedAt).toBeTruthy();
  });

  it('6. should not find many connectedAccounts anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      objectMetadataPluralName: 'connectedAccounts',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      filter: {
        id: {
          in: [CONNECTED_ACCOUNT_1_ID, CONNECTED_ACCOUNT_2_ID],
        },
      },
    });

    const findConnectedAccountsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      findConnectedAccountsResponse.body.data.connectedAccounts.edges,
    ).toHaveLength(0);
  });

  it('6b. should not find one connectedAccount anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      filter: {
        id: {
          eq: CONNECTED_ACCOUNT_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.connectedAccount).toBeNull();
  });

  it('7. should find many deleted connectedAccounts with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      objectMetadataPluralName: 'connectedAccounts',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      filter: {
        id: {
          in: [CONNECTED_ACCOUNT_1_ID, CONNECTED_ACCOUNT_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.connectedAccounts.edges).toHaveLength(2);
  });

  it('7b. should find one deleted connectedAccount with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      filter: {
        id: {
          eq: CONNECTED_ACCOUNT_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.connectedAccount.id).toEqual(
      CONNECTED_ACCOUNT_3_ID,
    );
  });

  it('8. should destroy many connectedAccounts', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      objectMetadataPluralName: 'connectedAccounts',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      filter: {
        id: {
          in: [CONNECTED_ACCOUNT_1_ID, CONNECTED_ACCOUNT_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyConnectedAccounts).toHaveLength(2);
  });

  it('8b. should destroy one connectedAccount', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      recordId: CONNECTED_ACCOUNT_3_ID,
    });

    const destroyConnectedAccountResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(
      destroyConnectedAccountResponse.body.data.destroyConnectedAccount,
    ).toBeTruthy();
  });

  it('9. should not find many connectedAccounts anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      objectMetadataPluralName: 'connectedAccounts',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      filter: {
        id: {
          in: [CONNECTED_ACCOUNT_1_ID, CONNECTED_ACCOUNT_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.connectedAccounts.edges).toHaveLength(0);
  });

  it('9b. should not find one connectedAccount anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'connectedAccount',
      gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
      filter: {
        id: {
          eq: CONNECTED_ACCOUNT_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.connectedAccount).toBeNull();
  });
});
