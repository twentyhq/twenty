import request from 'supertest';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const client = request(`http://localhost:${APP_PORT}`);

describe('api key and webhooks permissions', () => {
  describe('generateApiKeyToken', () => {
    it('should throw a permission error when user does not have permission (member role)', async () => {
      const queryData = {
        query: `
        mutation generateApiKeyToken {
          generateApiKeyToken(apiKeyId: "test-api-key-id", expiresAt: "2025-01-01T00:00:00Z") {
            token
          }
        }
      `,
      };

      await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
        .send(queryData)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeNull();
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].message).toBe(
            PermissionsExceptionMessage.PERMISSION_DENIED,
          );
          expect(res.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
        });
    });

    // Non-ACCESS tokens (API_KEY here, PLAYGROUND same path) must never mint
    // an API key — enforced by RequireAccessTokenGuard.
    it('should reject a non-ACCESS token even with API key permission', async () => {
      const queryData = {
        query: `
        mutation generateApiKeyToken {
          generateApiKeyToken(apiKeyId: "test-api-key-id", expiresAt: "2025-01-01T00:00:00Z") {
            token
          }
        }
      `,
      };

      await client
        .post('/metadata')
        .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
        .send(queryData)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeNull();
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
        });
    });
  });

  describe('createApiKey', () => {
    it('should reject a non-ACCESS token even with API key permission', async () => {
      const queryData = {
        query: `
        mutation createApiKey {
          createApiKey(input: { name: "escalation", expiresAt: "2025-01-01T00:00:00Z", roleId: "20202020-0000-4000-8000-000000000000" }) {
            id
          }
        }
      `,
      };

      await client
        .post('/metadata')
        .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
        .send(queryData)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeNull();
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
        });
    });
  });
});
