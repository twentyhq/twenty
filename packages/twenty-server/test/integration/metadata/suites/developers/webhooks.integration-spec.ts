import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

describe('webhooksResolver (e2e)', () => {
  let createdWebhookId: string | undefined;

  afterEach(async () => {
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
});
