import { gql } from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  createWebhook,
  createWebhookReceiver,
  deleteWebhook,
  getWebhook,
  getWebhooks,
  updateWebhook,
} from 'test/integration/metadata/suites/utils/webhook-test.util';
import { makeAdminPanelAPIRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { v4 as uuidv4 } from 'uuid';

import { type UpdateWebhookInput } from 'src/engine/metadata-modules/webhook/dtos/update-webhook.input';

const CREATE_CONFIG_VARIABLE_MUTATION = gql`
  mutation CreateDatabaseConfigVariable($key: String!, $value: JSON!) {
    createDatabaseConfigVariable(key: $key, value: $value)
  }
`;

const GET_CONFIG_VARIABLE_QUERY = gql`
  query GetDatabaseConfigVariable($key: String!) {
    getDatabaseConfigVariable(key: $key) {
      value
      source
    }
  }
`;

const DELETE_CONFIG_VARIABLE_MUTATION = gql`
  mutation DeleteDatabaseConfigVariable($key: String!) {
    deleteDatabaseConfigVariable(key: $key)
  }
`;

const DESTROY_PERSON_MUTATION = gql`
  mutation DestroyPerson($id: ID!) {
    destroyPerson(id: $id) {
      id
    }
  }
`;

const CREATE_PERSON_MUTATION = gql`
  mutation CreatePerson($data: PersonCreateInput!) {
    createPerson(data: $data) {
      id
      name {
        firstName
        lastName
      }
    }
  }
`;

describe('webhooksResolver (e2e)', () => {
  let createdWebhookId: string | undefined;
  let createdPersonId: string | undefined;

  afterEach(async () => {
    if (createdPersonId) {
      await makeGraphqlAPIRequest({
        query: DESTROY_PERSON_MUTATION,
        variables: { id: createdPersonId },
      }).catch(() => {});
      createdPersonId = undefined;
    }

    if (createdWebhookId) {
      await deleteWebhook(createdWebhookId).catch(() => {});
      createdWebhookId = undefined;
    }
  });

  describe('webhooks query', () => {
    it('should find many webhooks', async () => {
      const response = await getWebhooks();

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.webhooks).toBeDefined();
      expect(Array.isArray(response.body.data.webhooks)).toBe(true);
    });
  });

  describe('createWebhook mutation', () => {
    it('should create a webhook successfully', async () => {
      const webhookInput = {
        targetUrl: 'https://example.com/webhook',
        operations: ['person.created', 'company.updated'],
        description: 'Test webhook',
        secret: 'test-secret',
      };

      const response = await createWebhook(webhookInput);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();

      const createdWebhookData = response.body.data.createWebhook;

      expect(createdWebhookData).toBeDefined();
      expect(createdWebhookData.id).toBeDefined();
      expect(createdWebhookData.targetUrl).toBe(webhookInput.targetUrl);
      expect(createdWebhookData.operations).toEqual(webhookInput.operations);
      expect(createdWebhookData.description).toBe(webhookInput.description);
      expect(createdWebhookData.secret).toBe(webhookInput.secret);

      createdWebhookId = createdWebhookData.id;
    });

    it('should fail to create webhook with invalid URL', async () => {
      const webhookInput = {
        targetUrl: 'invalid-url',
        operations: ['person.created'],
        description: 'Test webhook',
        secret: 'test-secret',
      };

      const response = await createWebhook(webhookInput);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('updateWebhook mutation', () => {
    it('should update a webhook successfully', async () => {
      const createResponse = await createWebhook({
        targetUrl: 'https://example.com/webhook',
        operations: ['person.created'],
        description: 'Test webhook',
        secret: 'test-secret',
      });

      const createdWebhookData = createResponse.body.data.createWebhook;

      createdWebhookId = createdWebhookData.id;

      const updateInput: UpdateWebhookInput = {
        id: createdWebhookData.id,
        update: {
          targetUrl: 'https://updated.com/webhook',
          operations: ['person.updated', 'company.created'],
          description: 'Updated webhook',
          secret: 'updated-secret',
        },
      };

      const updateResponse = await updateWebhook(updateInput);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data).toBeDefined();
      expect(updateResponse.body.errors).toBeUndefined();

      const updatedWebhookData = updateResponse.body.data.updateWebhook;

      expect(updatedWebhookData.id).toBe(createdWebhookData.id);
      expect(updatedWebhookData.targetUrl).toBe(updateInput.update.targetUrl);
      expect(updatedWebhookData.operations).toEqual(
        updateInput.update.operations,
      );
      expect(updatedWebhookData.description).toBe(
        updateInput.update.description,
      );
      expect(updatedWebhookData.secret).toBe(updateInput.update.secret);
    });
  });

  describe('webhook query', () => {
    it('should find a specific webhook', async () => {
      const createResponse = await createWebhook({
        targetUrl: 'https://example.com/webhook',
        operations: ['person.created'],
        description: 'Test webhook',
        secret: 'test-secret',
      });

      const createdWebhookData = createResponse.body.data.createWebhook;

      createdWebhookId = createdWebhookData.id;

      const queryResponse = await getWebhook(createdWebhookData.id);

      expect(queryResponse.status).toBe(200);
      expect(queryResponse.body.data).toBeDefined();
      expect(queryResponse.body.errors).toBeUndefined();

      const webhookData = queryResponse.body.data.webhook;

      expect(webhookData).toBeDefined();
      expect(webhookData.id).toBe(createdWebhookData.id);
      expect(webhookData.targetUrl).toBe(createdWebhookData.targetUrl);
      expect(webhookData.operations).toEqual(createdWebhookData.operations);
      expect(webhookData.description).toBe(createdWebhookData.description);
      expect(webhookData.secret).toBe(createdWebhookData.secret);
    });
  });

  describe('deleteWebhook mutation', () => {
    it('should delete a webhook successfully', async () => {
      const createResponse = await createWebhook({
        targetUrl: 'https://example.com/webhook',
        operations: ['person.created'],
        description: 'Test webhook',
        secret: 'test-secret',
      });

      const createdWebhookData = createResponse.body.data.createWebhook;

      const deleteResponse = await deleteWebhook(createdWebhookData.id);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.data).toBeDefined();
      expect(deleteResponse.body.errors).toBeUndefined();

      const queryResponse = await getWebhook(createdWebhookData.id);

      expect(queryResponse.status).toBe(200);
      expect(queryResponse.body.data.webhook).toBeNull();

      createdWebhookId = undefined;
    });
  });

  describe('webhook delivery', () => {
    const WEBHOOK_RECEIVER_PORT = 4317;

    it('should block delivery to private IP when safe mode is enabled (SSRF protection)', async () => {
      const receiver = await createWebhookReceiver(WEBHOOK_RECEIVER_PORT);

      try {
        const createWebhookResponse = await createWebhook({
          targetUrl: `http://127.0.0.1:${WEBHOOK_RECEIVER_PORT}/webhook`,
          operations: ['person.created'],
          description: 'SSRF test webhook',
          secret: 'test-secret',
        });

        expect(createWebhookResponse.body.errors).toBeUndefined();
        createdWebhookId = createWebhookResponse.body.data.createWebhook.id;

        const testId = uuidv4().slice(0, 8);
        const createPersonResponse = await makeGraphqlAPIRequest({
          query: CREATE_PERSON_MUTATION,
          variables: {
            data: {
              name: {
                firstName: 'SSRFTest',
                lastName: `User-${testId}`,
              },
            },
          },
        });

        expect(createPersonResponse.status).toBe(200);
        expect(createPersonResponse.body.errors).toBeUndefined();
        createdPersonId = createPersonResponse.body.data.createPerson.id;

        jest.useRealTimers();
        await new Promise((resolve) => setTimeout(resolve, 100));
        jest.useFakeTimers();

        expect(receiver.receivedPayloads.length).toBe(0);
      } finally {
        await receiver.close();
      }
    });

    it('should deliver webhook successfully when safe mode is disabled', async () => {
      jest.useRealTimers();

      const receiver = await createWebhookReceiver(WEBHOOK_RECEIVER_PORT);

      try {
        const createConfigResponse = await makeAdminPanelAPIRequest({
          query: CREATE_CONFIG_VARIABLE_MUTATION,
          variables: {
            key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED',
            value: false,
          },
        });

        expect(createConfigResponse.body.errors).toBeUndefined();
        expect(
          createConfigResponse.body.data.createDatabaseConfigVariable,
        ).toBe(true);

        const verifyConfig = await makeAdminPanelAPIRequest({
          query: GET_CONFIG_VARIABLE_QUERY,
          variables: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED' },
        });

        expect(verifyConfig.body.data.getDatabaseConfigVariable.value).toBe(
          false,
        );
        expect(verifyConfig.body.data.getDatabaseConfigVariable.source).toBe(
          'DATABASE',
        );

        const createWebhookResponse = await createWebhook({
          targetUrl: `http://127.0.0.1:${WEBHOOK_RECEIVER_PORT}/webhook`,
          operations: ['person.created'],
          description: 'Delivery test webhook',
          secret: 'test-secret',
        });

        expect(createWebhookResponse.body.errors).toBeUndefined();
        createdWebhookId = createWebhookResponse.body.data.createWebhook.id;

        const testId = uuidv4().slice(0, 8);
        const createPersonResponse = await makeGraphqlAPIRequest({
          query: CREATE_PERSON_MUTATION,
          variables: {
            data: {
              name: {
                firstName: 'WebhookDelivery',
                lastName: `Test-${testId}`,
              },
            },
          },
        });

        expect(createPersonResponse.status).toBe(200);
        expect(createPersonResponse.body.errors).toBeUndefined();
        createdPersonId = createPersonResponse.body.data.createPerson.id;

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(receiver.receivedPayloads.length).toBe(1);
        expect(receiver.receivedPayloads[0]).toMatchObject({
          targetUrl: `http://127.0.0.1:${WEBHOOK_RECEIVER_PORT}/webhook`,
          eventName: 'person.created',
        });
      } finally {
        await receiver.close();
        await makeAdminPanelAPIRequest({
          query: DELETE_CONFIG_VARIABLE_MUTATION,
          variables: { key: 'HTTP_TOOL_SAFE_MODE_ENABLED' },
        }).catch(() => {});
        jest.useFakeTimers();
      }
    });
  });
});
