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
        .post('/graphql')
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
  });
});
