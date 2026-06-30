import request from 'supertest';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const SERVER_URL = `http://localhost:${APP_PORT}`;

describe('Impersonation - unauthenticated request denial (integration)', () => {
  it('rejects an impersonation request with no authentication', async () => {
    const response = await request(SERVER_URL)
      .post('/metadata')
      .send({
        query: `
          mutation Impersonate($userId: UUID!, $workspaceId: UUID!) {
            impersonate(userId: $userId, workspaceId: $workspaceId) {
              loginToken {
                token
              }
            }
          }
        `,
        variables: {
          userId: USER_DATA_SEED_IDS.JONY,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        },
      })
      .expect(200);

    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });
  });
});
