import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

describe('apiKeysResolver (e2e)', () => {
  let createdApiKeyId: string | undefined;
  let adminRoleId: string;

  beforeAll(async () => {
    const rolesResponse = await makeMetadataAPIRequest({
      query: gql`
        query GetRoles {
          getRoles {
            id
            label
          }
        }
      `,
    });

    if (rolesResponse.body.errors) {
      throw new Error(
        `Failed to get roles: ${JSON.stringify(rolesResponse.body.errors)}`,
      );
    }

    adminRoleId = rolesResponse.body.data.getRoles.find(
      (r: { label: string }) => r.label === 'Admin',
    )?.id as string;
  });

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
              role {
                id
                label
                icon
              }
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
        roleId: adminRoleId,
      };

      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateApiKey($input: CreateApiKeyInput!) {
            createApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
              role {
                id
                label
              }
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
      expect(createdApiKey.role).toBeDefined();
      expect(createdApiKey.role.id).toBe(adminRoleId);
      expect(createdApiKey.role.label).toBe('Admin');

      createdApiKeyId = createdApiKey.id;
    });

    it('should fail to create API key with invalid expiry date', async () => {
      const apiKeyInput = {
        name: 'Test API Key',
        expiresAt: 'invalid-date',
        roleId: adminRoleId,
      };

      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateApiKey($input: CreateApiKeyInput!) {
            createApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
              roleId
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
          mutation CreateApiKey($input: CreateApiKeyInput!) {
            createApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
              role {
                id
                label
              }
            }
          }
        `,
        variables: {
          input: {
            name: 'Test API Key',
            expiresAt: '2025-12-31T23:59:59Z',
            roleId: adminRoleId,
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
          mutation UpdateApiKey($input: UpdateApiKeyInput!) {
            updateApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
              role {
                id
                label
              }
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

      expect(updatedApiKey).toBeDefined();
      expect(updatedApiKey.id).toBe(createdApiKey.id);
      expect(updatedApiKey.name).toBe(updateInput.name);
      expect(updatedApiKey.expiresAt).toBe('2026-01-01T00:00:00.000Z');
      expect(updatedApiKey.revokedAt).toBeNull();
      expect(updatedApiKey.role).toBeDefined();
      expect(updatedApiKey.role.id).toBe(adminRoleId);
    });
  });

  describe('apiKey query', () => {
    it('should find a specific API key', async () => {
      const createResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateApiKey($input: CreateApiKeyInput!) {
            createApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
              role {
                id
                label
              }
            }
          }
        `,
        variables: {
          input: {
            name: 'Test API Key',
            expiresAt: '2025-12-31T23:59:59Z',
            roleId: adminRoleId,
          },
        },
      });

      const createdApiKey = createResponse.body.data.createApiKey;

      createdApiKeyId = createdApiKey.id;

      const apiKeyResponse = await makeMetadataAPIRequest({
        query: gql`
          query GetApiKey($input: GetApiKeyInput!) {
            apiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
              role {
                id
                label
              }
            }
          }
        `,
        variables: {
          input: { id: createdApiKey.id },
        },
      });

      expect(apiKeyResponse.status).toBe(200);
      expect(apiKeyResponse.body.data).toBeDefined();
      expect(apiKeyResponse.body.errors).toBeUndefined();

      const foundApiKey = apiKeyResponse.body.data.apiKey;

      expect(foundApiKey).toBeDefined();
      expect(foundApiKey.id).toBe(createdApiKey.id);
      expect(foundApiKey.name).toBe('Test API Key');
      expect(foundApiKey.role).toBeDefined();
      expect(foundApiKey.role.id).toBe(adminRoleId);
    });
  });

  describe('revokeApiKey mutation', () => {
    it('should revoke an API key successfully', async () => {
      const createResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateApiKey($input: CreateApiKeyInput!) {
            createApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
              role {
                id
                label
              }
            }
          }
        `,
        variables: {
          input: {
            name: 'Test API Key for Revoke',
            expiresAt: '2025-12-31T23:59:59Z',
            roleId: adminRoleId,
          },
        },
      });

      const createdApiKey = createResponse.body.data.createApiKey;

      createdApiKeyId = createdApiKey.id;

      const revokeResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation RevokeApiKey($input: RevokeApiKeyInput!) {
            revokeApiKey(input: $input) {
              id
              name
              expiresAt
              revokedAt
              role {
                id
                label
              }
            }
          }
        `,
        variables: {
          input: { id: createdApiKeyId },
        },
      });

      expect(revokeResponse.status).toBe(200);
      expect(revokeResponse.body.data).toBeDefined();
      expect(revokeResponse.body.errors).toBeUndefined();

      const revokedApiKey = revokeResponse.body.data.revokeApiKey;

      expect(revokedApiKey).toBeDefined();
      expect(revokedApiKey.id).toBe(createdApiKeyId);
      expect(revokedApiKey.revokedAt).toBeDefined();
      expect(revokedApiKey.role).toBeDefined();
      expect(revokedApiKey.role.id).toBe(adminRoleId);
    });
  });
});
