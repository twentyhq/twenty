import http from 'http';

import { gql } from 'graphql-tag';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeAdminPanelAPIRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { v4 as uuidv4 } from 'uuid';

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

// Helper to create a simple HTTP server for testing webhook delivery
const createWebhookReceiver = (
  port: number,
): Promise<{
  server: http.Server;
  receivedPayloads: object[];
  close: () => Promise<void>;
}> => {
  return new Promise((resolve) => {
    const receivedPayloads: object[] = [];

    const server = http.createServer((req, res) => {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          receivedPayloads.push(JSON.parse(body));
        } catch {
          receivedPayloads.push({ raw: body });
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      });
    });

    server.listen(port, '127.0.0.1', () => {
      resolve({
        server,
        receivedPayloads,
        close: () =>
          new Promise<void>((resolveClose) =>
            server.close(() => resolveClose()),
          ),
      });
    });
  });
};

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
      await makeMetadataAPIRequest({
        query: gql`
          mutation DeleteWebhook($input: DeleteWebhookInput!) {
            deleteWebhook(input: $input)
          }
        `,
        variables: {
          input: { id: createdWebhookId },
        },
      }).catch(() => {});
      createdWebhookId = undefined;
    }
  });

  describe('webhooks query', () => {
    it('should find many webhooks', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query GetWebhooks {
            webhooks {
              id
              targetUrl
              operations
              description
              secret
            }
          }
        `,
      });

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

      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateWebhook($input: CreateWebhookInput!) {
            createWebhook(input: $input) {
              id
              targetUrl
              operations
              description
              secret
            }
          }
        `,
        variables: {
          input: webhookInput,
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();

      const createdWebhook = response.body.data.createWebhook;

      expect(createdWebhook).toBeDefined();
      expect(createdWebhook.id).toBeDefined();
      expect(createdWebhook.targetUrl).toBe(webhookInput.targetUrl);
      expect(createdWebhook.operations).toEqual(webhookInput.operations);
      expect(createdWebhook.description).toBe(webhookInput.description);
      expect(createdWebhook.secret).toBe(webhookInput.secret);

      createdWebhookId = createdWebhook.id;
    });

    it('should fail to create webhook with invalid URL', async () => {
      const webhookInput = {
        targetUrl: 'invalid-url',
        operations: ['person.created'],
        description: 'Test webhook',
        secret: 'test-secret',
      };

      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateWebhook($input: CreateWebhookInput!) {
            createWebhook(input: $input) {
              id
              targetUrl
              operations
              description
              secret
            }
          }
        `,
        variables: {
          input: webhookInput,
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('updateWebhook mutation', () => {
    it('should update a webhook successfully', async () => {
      const createResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateWebhook($input: CreateWebhookInput!) {
            createWebhook(input: $input) {
              id
              targetUrl
              operations
              description
              secret
            }
          }
        `,
        variables: {
          input: {
            targetUrl: 'https://example.com/webhook',
            operations: ['person.created'],
            description: 'Test webhook',
            secret: 'test-secret',
          },
        },
      });

      const createdWebhook = createResponse.body.data.createWebhook;

      createdWebhookId = createdWebhook.id;

      const updateInput = {
        id: createdWebhook.id,
        targetUrl: 'https://updated.com/webhook',
        operations: ['person.updated', 'company.created'],
        description: 'Updated webhook',
        secret: 'updated-secret',
      };

      const updateResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation UpdateWebhook($input: UpdateWebhookInput!) {
            updateWebhook(input: $input) {
              id
              targetUrl
              operations
              description
              secret
            }
          }
        `,
        variables: {
          input: updateInput,
        },
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data).toBeDefined();
      expect(updateResponse.body.errors).toBeUndefined();

      const updatedWebhook = updateResponse.body.data.updateWebhook;

      expect(updatedWebhook.id).toBe(createdWebhook.id);
      expect(updatedWebhook.targetUrl).toBe(updateInput.targetUrl);
      expect(updatedWebhook.operations).toEqual(updateInput.operations);
      expect(updatedWebhook.description).toBe(updateInput.description);
      expect(updatedWebhook.secret).toBe(updateInput.secret);
    });
  });

  describe('webhook query', () => {
    it('should find a specific webhook', async () => {
      const createResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateWebhook($input: CreateWebhookInput!) {
            createWebhook(input: $input) {
              id
              targetUrl
              operations
              description
              secret
            }
          }
        `,
        variables: {
          input: {
            targetUrl: 'https://example.com/webhook',
            operations: ['person.created'],
            description: 'Test webhook',
            secret: 'test-secret',
          },
        },
      });

      const createdWebhook = createResponse.body.data.createWebhook;

      createdWebhookId = createdWebhook.id;

      const queryResponse = await makeMetadataAPIRequest({
        query: gql`
          query GetWebhook($input: GetWebhookInput!) {
            webhook(input: $input) {
              id
              targetUrl
              operations
              description
              secret
            }
          }
        `,
        variables: {
          input: { id: createdWebhook.id },
        },
      });

      expect(queryResponse.status).toBe(200);
      expect(queryResponse.body.data).toBeDefined();
      expect(queryResponse.body.errors).toBeUndefined();

      const webhook = queryResponse.body.data.webhook;

      expect(webhook).toBeDefined();
      expect(webhook.id).toBe(createdWebhook.id);
      expect(webhook.targetUrl).toBe(createdWebhook.targetUrl);
      expect(webhook.operations).toEqual(createdWebhook.operations);
      expect(webhook.description).toBe(createdWebhook.description);
      expect(webhook.secret).toBe(createdWebhook.secret);
    });
  });

  describe('deleteWebhook mutation', () => {
    it('should delete a webhook successfully', async () => {
      const createResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateWebhook($input: CreateWebhookInput!) {
            createWebhook(input: $input) {
              id
              targetUrl
              operations
              description
              secret
            }
          }
        `,
        variables: {
          input: {
            targetUrl: 'https://example.com/webhook',
            operations: ['person.created'],
            description: 'Test webhook',
            secret: 'test-secret',
          },
        },
      });

      const createdWebhook = createResponse.body.data.createWebhook;

      const deleteResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation DeleteWebhook($input: DeleteWebhookInput!) {
            deleteWebhook(input: $input)
          }
        `,
        variables: {
          input: { id: createdWebhook.id },
        },
      });

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.data).toBeDefined();
      expect(deleteResponse.body.errors).toBeUndefined();

      const queryResponse = await makeMetadataAPIRequest({
        query: gql`
          query GetWebhook($input: GetWebhookInput!) {
            webhook(input: $input) {
              id
              targetUrl
              operations
              description
              secret
            }
          }
        `,
        variables: {
          input: { id: createdWebhook.id },
        },
      });

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
        const createWebhookResponse = await makeMetadataAPIRequest({
          query: gql`
            mutation CreateWebhook($input: CreateWebhookInput!) {
              createWebhook(input: $input) {
                id
                targetUrl
              }
            }
          `,
          variables: {
            input: {
              targetUrl: `http://127.0.0.1:${WEBHOOK_RECEIVER_PORT}/webhook`,
              operations: ['person.created'],
              description: 'SSRF test webhook',
              secret: 'test-secret',
            },
          },
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

        expect(receiver.receivedPayloads.length).toBe(0);
      } finally {
        await receiver.close();
      }
    });

    it('should deliver webhook successfully when safe mode is disabled', async () => {
      // Use real timers since Jest's fake timers interfere with HTTP requests
      jest.useRealTimers();

      const receiver = await createWebhookReceiver(WEBHOOK_RECEIVER_PORT);

      try {
        // Disable SSRF protection to allow localhost webhook delivery
        const createConfigResponse = await makeAdminPanelAPIRequest({
          query: CREATE_CONFIG_VARIABLE_MUTATION,
          variables: {
            key: 'HTTP_TOOL_SAFE_MODE_ENABLED',
            value: false,
          },
        });

        expect(createConfigResponse.body.errors).toBeUndefined();
        expect(
          createConfigResponse.body.data.createDatabaseConfigVariable,
        ).toBe(true);

        const verifyConfig = await makeAdminPanelAPIRequest({
          query: GET_CONFIG_VARIABLE_QUERY,
          variables: { key: 'HTTP_TOOL_SAFE_MODE_ENABLED' },
        });

        expect(verifyConfig.body.data.getDatabaseConfigVariable.value).toBe(
          false,
        );
        expect(verifyConfig.body.data.getDatabaseConfigVariable.source).toBe(
          'DATABASE',
        );

        const createWebhookResponse = await makeMetadataAPIRequest({
          query: gql`
            mutation CreateWebhook($input: CreateWebhookInput!) {
              createWebhook(input: $input) {
                id
                targetUrl
              }
            }
          `,
          variables: {
            input: {
              targetUrl: `http://127.0.0.1:${WEBHOOK_RECEIVER_PORT}/webhook`,
              operations: ['person.created'],
              description: 'Delivery test webhook',
              secret: 'test-secret',
            },
          },
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

        // Wait for async event processing
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
