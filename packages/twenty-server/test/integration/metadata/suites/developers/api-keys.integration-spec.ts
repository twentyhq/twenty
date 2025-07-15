import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

describe('apiKeysResolver (e2e)', () => {
  let createdApiKeyId: string | undefined;

  afterEach(async () => {
    if (createdApiKeyId) {
      await testDataSource
        .query('DELETE FROM core."apiKey" WHERE id = $1', [createdApiKeyId])
        .catch(() => {});
      createdApiKeyId = undefined;
    }
  });

  describe('apiKeys query', () => {
    it('should find many API keys', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query GetApiKeys {
            apiKeys {
              id
              name
              expiresAt
              revokedAt
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.apiKeys).toBeDefined();
      expect(Array.isArray(response.body.data.apiKeys)).toBe(true);
    });
  });

  describe('createApiKey mutation', () => {
    it('should create an API key successfully', async () => {
      const apiKeyInput = {
        name: 'Test API Key',
        expiresAt: '2025-12-31T23:59:59Z',
      };

      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateApiKey($input: CreateApiKeyDTO!) {
            createApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
            }
          }
        `,
        variables: {
          input: apiKeyInput,
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();

      const createdApiKey = response.body.data.createApiKey;

      expect(createdApiKey).toBeDefined();
      expect(createdApiKey.id).toBeDefined();
      expect(createdApiKey.name).toBe(apiKeyInput.name);
      expect(createdApiKey.expiresAt).toBe('2025-12-31T23:59:59.000Z');
      expect(createdApiKey.revokedAt).toBeNull();

      createdApiKeyId = createdApiKey.id;
    });

    it('should fail to create API key with invalid expiry date', async () => {
      const apiKeyInput = {
        name: 'Test API Key',
        expiresAt: 'invalid-date',
      };

      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateApiKey($input: CreateApiKeyDTO!) {
            createApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
            }
          }
        `,
        variables: {
          input: apiKeyInput,
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('updateApiKey mutation', () => {
    it('should update an API key successfully', async () => {
      const createResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateApiKey($input: CreateApiKeyDTO!) {
            createApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
            }
          }
        `,
        variables: {
          input: {
            name: 'Test API Key',
            expiresAt: '2025-12-31T23:59:59Z',
          },
        },
      });

      const createdApiKey = createResponse.body.data.createApiKey;

      createdApiKeyId = createdApiKey.id;

      const updateInput = {
        id: createdApiKey.id,
        name: 'Updated API Key',
        expiresAt: '2026-01-01T00:00:00Z',
      };

      const updateResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation UpdateApiKey($input: UpdateApiKeyDTO!) {
            updateApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
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

      const updatedApiKey = updateResponse.body.data.updateApiKey;

      expect(updatedApiKey.id).toBe(createdApiKey.id);
      expect(updatedApiKey.name).toBe(updateInput.name);
      expect(updatedApiKey.expiresAt).toBe('2026-01-01T00:00:00.000Z');
      expect(updatedApiKey.revokedAt).toBeNull();
    });
  });

  describe('apiKey query', () => {
    it('should find a specific API key', async () => {
      const createResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateApiKey($input: CreateApiKeyDTO!) {
            createApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
            }
          }
        `,
        variables: {
          input: {
            name: 'Test API Key',
            expiresAt: '2025-12-31T23:59:59Z',
          },
        },
      });

      const createdApiKey = createResponse.body.data.createApiKey;

      createdApiKeyId = createdApiKey.id;

      const queryResponse = await makeMetadataAPIRequest({
        query: gql`
          query GetApiKey($input: GetApiKeyDTO!) {
            apiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
            }
          }
        `,
        variables: {
          input: { id: createdApiKey.id },
        },
      });

      expect(queryResponse.status).toBe(200);
      expect(queryResponse.body.data).toBeDefined();
      expect(queryResponse.body.errors).toBeUndefined();

      const apiKey = queryResponse.body.data.apiKey;

      expect(apiKey).toBeDefined();
      expect(apiKey.id).toBe(createdApiKey.id);
      expect(apiKey.name).toBe(createdApiKey.name);
      expect(apiKey.expiresAt).toBe(createdApiKey.expiresAt);
      expect(apiKey.revokedAt).toBeNull();
    });
  });

  describe('revokeApiKey mutation', () => {
    it('should revoke an API key successfully', async () => {
      const createResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateApiKey($input: CreateApiKeyDTO!) {
            createApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
            }
          }
        `,
        variables: {
          input: {
            name: 'Test API Key',
            expiresAt: '2025-12-31T23:59:59Z',
          },
        },
      });

      const createdApiKey = createResponse.body.data.createApiKey;

      createdApiKeyId = createdApiKey.id;

      const revokeResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation RevokeApiKey($input: RevokeApiKeyDTO!) {
            revokeApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
            }
          }
        `,
        variables: {
          input: { id: createdApiKey.id },
        },
      });

      expect(revokeResponse.status).toBe(200);
      expect(revokeResponse.body.data).toBeDefined();
      expect(revokeResponse.body.errors).toBeUndefined();

      const revokedApiKey = revokeResponse.body.data.revokeApiKey;

      expect(revokedApiKey.id).toBe(createdApiKey.id);
      expect(revokedApiKey.name).toBe(createdApiKey.name);
      expect(revokedApiKey.expiresAt).toBe(createdApiKey.expiresAt);
      expect(revokedApiKey.revokedAt).not.toBeNull();
    });
  });
});
