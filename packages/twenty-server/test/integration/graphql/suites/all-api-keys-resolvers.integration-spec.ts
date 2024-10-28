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

const API_KEY_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const API_KEY_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const API_KEY_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const API_KEY_GQL_FIELDS = `
    id
    name
    expiresAt
    revokedAt
    createdAt
    updatedAt
    deletedAt
`;

describe('apiKeys resolvers (integration)', () => {
  it('1. should create and return API keys', async () => {
    const apiKeyName1 = generateRecordName(API_KEY_1_ID);
    const apiKeyName2 = generateRecordName(API_KEY_2_ID);

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'apiKey',
      objectMetadataPluralName: 'apiKeys',
      gqlFields: API_KEY_GQL_FIELDS,
      data: [
        {
          id: API_KEY_1_ID,
          name: apiKeyName1,
          expiresAt: new Date(),
        },
        {
          id: API_KEY_2_ID,
          name: apiKeyName2,
          expiresAt: new Date(),
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createApiKeys).toHaveLength(2);

    response.body.data.createApiKeys.forEach((apiKey) => {
      expect(apiKey).toHaveProperty('name');
      expect([apiKeyName1, apiKeyName2]).toContain(apiKey.name);
      expect(apiKey).toHaveProperty('expiresAt');
      expect(apiKey).toHaveProperty('revokedAt');
      expect(apiKey).toHaveProperty('id');
      expect(apiKey).toHaveProperty('createdAt');
      expect(apiKey).toHaveProperty('updatedAt');
      expect(apiKey).toHaveProperty('deletedAt');
    });
  });

  it('1b. should create and return one API key', async () => {
    const apiKeyName = generateRecordName(API_KEY_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'apiKey',
      gqlFields: API_KEY_GQL_FIELDS,
      data: {
        id: API_KEY_3_ID,
        name: apiKeyName,
        expiresAt: new Date(),
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdApiKey = response.body.data.createApiKey;

    expect(createdApiKey).toHaveProperty('name');
    expect(createdApiKey.name).toEqual(apiKeyName);
    expect(createdApiKey).toHaveProperty('expiresAt');
    expect(createdApiKey).toHaveProperty('revokedAt');
    expect(createdApiKey).toHaveProperty('id');
    expect(createdApiKey).toHaveProperty('createdAt');
    expect(createdApiKey).toHaveProperty('updatedAt');
    expect(createdApiKey).toHaveProperty('deletedAt');
  });

  it('2. should find many API keys', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'apiKey',
      objectMetadataPluralName: 'apiKeys',
      gqlFields: API_KEY_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.apiKeys;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const apiKeys = edges[0].node;

      expect(apiKeys).toHaveProperty('name');
      expect(apiKeys).toHaveProperty('expiresAt');
      expect(apiKeys).toHaveProperty('revokedAt');
      expect(apiKeys).toHaveProperty('id');
      expect(apiKeys).toHaveProperty('createdAt');
      expect(apiKeys).toHaveProperty('updatedAt');
      expect(apiKeys).toHaveProperty('deletedAt');
    }
  });

  it('2b. should find one API key', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'apiKey',
      gqlFields: API_KEY_GQL_FIELDS,
      filter: {
        id: {
          eq: API_KEY_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const apiKey = response.body.data.apiKey;

    expect(apiKey).toHaveProperty('name');
    expect(apiKey).toHaveProperty('expiresAt');
    expect(apiKey).toHaveProperty('revokedAt');
    expect(apiKey).toHaveProperty('id');
    expect(apiKey).toHaveProperty('createdAt');
    expect(apiKey).toHaveProperty('updatedAt');
    expect(apiKey).toHaveProperty('deletedAt');
  });

  it('3. should update many API keys', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'apiKey',
      objectMetadataPluralName: 'apiKeys',
      gqlFields: API_KEY_GQL_FIELDS,
      data: {
        name: 'Updated Name',
      },
      filter: {
        id: {
          in: [API_KEY_1_ID, API_KEY_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedApiKeys = response.body.data.updateApiKeys;

    expect(updatedApiKeys).toHaveLength(2);

    updatedApiKeys.forEach((apiKey) => {
      expect(apiKey.name).toEqual('Updated Name');
    });
  });

  it('3b. should update one API key', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'apiKey',
      gqlFields: API_KEY_GQL_FIELDS,
      data: {
        name: 'New Name',
      },
      recordId: API_KEY_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedApiKey = response.body.data.updateApiKey;

    expect(updatedApiKey.name).toEqual('New Name');
  });

  it('4. should find many API keys with updated name', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'apiKey',
      objectMetadataPluralName: 'apiKeys',
      gqlFields: API_KEY_GQL_FIELDS,
      filter: {
        name: {
          eq: 'Updated Name',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.apiKeys.edges).toHaveLength(2);
  });

  it('4b. should find one API key with updated name', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'apiKey',
      gqlFields: API_KEY_GQL_FIELDS,
      filter: {
        name: {
          eq: 'New Name',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.apiKey.name).toEqual('New Name');
  });

  it('5. should delete many API keys', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'apiKey',
      objectMetadataPluralName: 'apiKeys',
      gqlFields: API_KEY_GQL_FIELDS,
      filter: {
        id: {
          in: [API_KEY_1_ID, API_KEY_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deletedApiKeys = response.body.data.deleteApiKeys;

    expect(deletedApiKeys).toHaveLength(2);

    deletedApiKeys.forEach((apiKey) => {
      expect(apiKey.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one API key', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'apiKey',
      gqlFields: API_KEY_GQL_FIELDS,
      recordId: API_KEY_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteApiKey.deletedAt).toBeTruthy();
  });

  it('6. should not find many API keys anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'apiKey',
      objectMetadataPluralName: 'apiKeys',
      gqlFields: API_KEY_GQL_FIELDS,
      filter: {
        id: {
          in: [API_KEY_1_ID, API_KEY_2_ID],
        },
      },
    });

    const findApiKeysResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(findApiKeysResponse.body.data.apiKeys.edges).toHaveLength(0);
  });

  it('6b. should not find one API key anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'apiKey',
      gqlFields: API_KEY_GQL_FIELDS,
      filter: {
        id: {
          eq: API_KEY_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.apiKey).toBeNull();
  });

  it('7. should find many deleted API keys with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'apiKey',
      objectMetadataPluralName: 'apiKeys',
      gqlFields: API_KEY_GQL_FIELDS,
      filter: {
        id: {
          in: [API_KEY_1_ID, API_KEY_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.apiKeys.edges).toHaveLength(2);
  });

  it('7b. should find one deleted API key with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'apiKey',
      gqlFields: API_KEY_GQL_FIELDS,
      filter: {
        id: {
          eq: API_KEY_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.apiKey.id).toEqual(API_KEY_3_ID);
  });

  it('8. should destroy many API keys', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'apiKey',
      objectMetadataPluralName: 'apiKeys',
      gqlFields: API_KEY_GQL_FIELDS,
      filter: {
        id: {
          in: [API_KEY_1_ID, API_KEY_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyApiKeys).toHaveLength(2);
  });

  it('8b. should destroy one API key', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'apiKey',
      gqlFields: API_KEY_GQL_FIELDS,
      recordId: API_KEY_3_ID,
    });

    const destroyApiKeyResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyApiKeyResponse.body.data.destroyApiKey).toBeTruthy();
  });

  it('9. should not find many API keys anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'apiKey',
      objectMetadataPluralName: 'apiKeys',
      gqlFields: API_KEY_GQL_FIELDS,
      filter: {
        id: {
          in: [API_KEY_1_ID, API_KEY_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.apiKeys.edges).toHaveLength(0);
  });

  it('9b. should not find one API key anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'apiKey',
      gqlFields: API_KEY_GQL_FIELDS,
      filter: {
        id: {
          eq: API_KEY_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.apiKey).toBeNull();
  });
});
