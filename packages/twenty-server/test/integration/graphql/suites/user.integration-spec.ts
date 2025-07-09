import request from 'supertest';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const client = request(`http://localhost:${APP_PORT}`);

describe('deleteUser', () => {
  it('should not allow to delete user if they are the unique admin of a workspace', async () => {
    const query = {
      query: `
        mutation DeleteUser {
            deleteUser {
                id
            }
        }
      `,
    };

    await client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(query)
      .expect((res) => {
        expect(res.body.data).toBeNull();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].message).toBe(
          'Cannot delete account: user is the unique admin of a workspace',
        );
        expect(res.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });
  });
});
