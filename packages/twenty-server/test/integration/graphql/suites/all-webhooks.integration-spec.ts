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

const WEBHOOK_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const WEBHOOK_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const WEBHOOK_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';

const WEBHOOK_GQL_FIELDS = `
  id
  targetUrl
  operations
  description
  createdAt
  updatedAt
  deletedAt
`;

describe('webhooks resolvers (integration)', () => {
  it('1. should create and return webhooks', async () => {
    const webhookDescription1 = generateRecordName(WEBHOOK_1_ID);
    const webhookDescription2 = generateRecordName(WEBHOOK_2_ID);

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'webhook',
      objectMetadataPluralName: 'webhooks',
      gqlFields: WEBHOOK_GQL_FIELDS,
      data: [
        {
          id: WEBHOOK_1_ID,
          description: webhookDescription1,
        },
        {
          id: WEBHOOK_2_ID,
          description: webhookDescription2,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createWebhooks).toHaveLength(2);

    response.body.data.createWebhooks.forEach((webhook) => {
      expect(webhook).toHaveProperty('description');
      expect([webhookDescription1, webhookDescription2]).toContain(
        webhook.description,
      );
      expect(webhook).toHaveProperty('operations');
      expect(webhook).toHaveProperty('id');
      expect(webhook).toHaveProperty('targetUrl');
      expect(webhook).toHaveProperty('createdAt');
      expect(webhook).toHaveProperty('updatedAt');
      expect(webhook).toHaveProperty('deletedAt');
    });
  });

  it('1b. should create and return one webhook', async () => {
    const webhookDescription = generateRecordName(WEBHOOK_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'webhook',
      gqlFields: WEBHOOK_GQL_FIELDS,
      data: {
        id: WEBHOOK_3_ID,
        description: webhookDescription,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdWebhook = response.body.data.createWebhook;

    expect(createdWebhook).toHaveProperty('description');
    expect(createdWebhook.description).toEqual(webhookDescription);
    expect(createdWebhook).toHaveProperty('operations');
    expect(createdWebhook).toHaveProperty('id');
    expect(createdWebhook).toHaveProperty('targetUrl');
    expect(createdWebhook).toHaveProperty('createdAt');
    expect(createdWebhook).toHaveProperty('updatedAt');
    expect(createdWebhook).toHaveProperty('deletedAt');
  });

  it('2. should find many webhooks', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'webhook',
      objectMetadataPluralName: 'webhooks',
      gqlFields: WEBHOOK_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.webhooks;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    if (data.edges.length > 0) {
      const webhooks = data.edges[0].node;

      expect(webhooks).toHaveProperty('targetUrl');
      expect(webhooks).toHaveProperty('operations');
      expect(webhooks).toHaveProperty('id');
      expect(webhooks).toHaveProperty('description');
      expect(webhooks).toHaveProperty('createdAt');
      expect(webhooks).toHaveProperty('updatedAt');
      expect(webhooks).toHaveProperty('deletedAt');
    }
  });

  it('2b. should find one webhook', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'webhook',
      gqlFields: WEBHOOK_GQL_FIELDS,
      filter: {
        id: {
          eq: WEBHOOK_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const webhook = response.body.data.webhook;

    expect(webhook).toHaveProperty('targetUrl');
    expect(webhook).toHaveProperty('operations');
    expect(webhook).toHaveProperty('id');
    expect(webhook).toHaveProperty('description');
    expect(webhook).toHaveProperty('createdAt');
    expect(webhook).toHaveProperty('updatedAt');
    expect(webhook).toHaveProperty('deletedAt');
  });

  it('3. should update many webhooks', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'webhook',
      objectMetadataPluralName: 'webhooks',
      gqlFields: WEBHOOK_GQL_FIELDS,
      data: {
        description: 'Updated Description',
      },
      filter: {
        id: {
          in: [WEBHOOK_1_ID, WEBHOOK_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedWebhooks = response.body.data.updateWebhooks;

    expect(updatedWebhooks).toHaveLength(2);

    updatedWebhooks.forEach((webhook) => {
      expect(webhook.description).toEqual('Updated Description');
    });
  });

  it('3b. should update one webhook', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'webhook',
      gqlFields: WEBHOOK_GQL_FIELDS,
      data: {
        description: 'New Description',
      },
      recordId: WEBHOOK_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedWebhook = response.body.data.updateWebhook;

    expect(updatedWebhook.description).toEqual('New Description');
  });

  it('4. should find many webhooks with updated description', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'webhook',
      objectMetadataPluralName: 'webhooks',
      gqlFields: WEBHOOK_GQL_FIELDS,
      filter: {
        description: {
          eq: 'Updated Description',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.webhooks.edges).toHaveLength(2);
  });

  it('4b. should find one webhook with updated description', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'webhook',
      gqlFields: WEBHOOK_GQL_FIELDS,
      filter: {
        description: {
          eq: 'New Description',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.webhook.description).toEqual('New Description');
  });

  it('5. should delete many webhooks', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'webhook',
      objectMetadataPluralName: 'webhooks',
      gqlFields: WEBHOOK_GQL_FIELDS,
      filter: {
        id: {
          in: [WEBHOOK_1_ID, WEBHOOK_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deletedWebhooks = response.body.data.deleteWebhooks;

    expect(deletedWebhooks).toHaveLength(2);

    deletedWebhooks.forEach((webhook) => {
      expect(webhook.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one webhook', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'webhook',
      gqlFields: WEBHOOK_GQL_FIELDS,
      recordId: WEBHOOK_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteWebhook.deletedAt).toBeTruthy();
  });

  it('6. should not find many webhooks anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'webhook',
      objectMetadataPluralName: 'webhooks',
      gqlFields: WEBHOOK_GQL_FIELDS,
      filter: {
        id: {
          in: [WEBHOOK_1_ID, WEBHOOK_2_ID],
        },
      },
    });

    const findWebhooksResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(findWebhooksResponse.body.data.webhooks.edges).toHaveLength(0);
  });

  it('6b. should not find one webhook anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'webhook',
      gqlFields: WEBHOOK_GQL_FIELDS,
      filter: {
        id: {
          eq: WEBHOOK_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.webhook).toBeNull();
  });

  it('7. should find many deleted webhooks with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'webhook',
      objectMetadataPluralName: 'webhooks',
      gqlFields: WEBHOOK_GQL_FIELDS,
      filter: {
        id: {
          in: [WEBHOOK_1_ID, WEBHOOK_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.webhooks.edges).toHaveLength(2);
  });

  it('7b. should find one deleted webhook with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'webhook',
      gqlFields: WEBHOOK_GQL_FIELDS,
      filter: {
        id: {
          eq: WEBHOOK_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.webhook.id).toEqual(WEBHOOK_3_ID);
  });

  it('8. should destroy many webhooks', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'webhook',
      objectMetadataPluralName: 'webhooks',
      gqlFields: WEBHOOK_GQL_FIELDS,
      filter: {
        id: {
          in: [WEBHOOK_1_ID, WEBHOOK_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyWebhooks).toHaveLength(2);
  });

  it('8b. should destroy one webhook', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'webhook',
      gqlFields: WEBHOOK_GQL_FIELDS,
      recordId: WEBHOOK_3_ID,
    });

    const destroyWebhookResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyWebhookResponse.body.data.destroyWebhook).toBeTruthy();
  });

  it('9. should not find many webhooks anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'webhook',
      objectMetadataPluralName: 'webhooks',
      gqlFields: WEBHOOK_GQL_FIELDS,
      filter: {
        id: {
          in: [WEBHOOK_1_ID, WEBHOOK_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.webhooks.edges).toHaveLength(0);
  });

  it('9b. should not find one webhook anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'webhook',
      gqlFields: WEBHOOK_GQL_FIELDS,
      filter: {
        id: {
          eq: WEBHOOK_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.webhook).toBeNull();
  });
});
