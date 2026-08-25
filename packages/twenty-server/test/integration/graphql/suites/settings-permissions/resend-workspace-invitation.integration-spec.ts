import request from 'supertest';

import { AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';

const client = request(`http://localhost:${APP_PORT}`);

const NON_EXISTING_ROLE_ID = '20202020-0000-4000-8000-000000000000';
const INVITEE_EMAIL = 'resend-preserves-invitation@example.com';
const INVITATION_VALUE = 'resend-preserves-invitation-token-value';

const seedInvitationWithRole = async (): Promise<string> => {
  const rows = await testDataSource.query(
    `INSERT INTO core."appToken" ("workspaceId", "type", "value", "expiresAt", "context")
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING "id"`,
    [
      SEED_APPLE_WORKSPACE_ID,
      AppTokenType.InvitationToken,
      INVITATION_VALUE,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      JSON.stringify({ email: INVITEE_EMAIL, roleId: NON_EXISTING_ROLE_ID }),
    ],
  );

  return rows[0].id;
};

describe('resendWorkspaceInvitation', () => {
  afterEach(async () => {
    await deleteWorkspaceInvitationsByEmail({ email: INVITEE_EMAIL });
  });

  it('should preserve the original invitation when the resend fails a pre-creation check', async () => {
    const appTokenId = await seedInvitationWithRole();

    const queryData = {
      query: `
        mutation resendWorkspaceInvitation {
          resendWorkspaceInvitation(appTokenId: "${appTokenId}") {
            success
          }
        }
      `,
    };

    await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.errors).toBeDefined();
      });

    const remainingInvitations = await findWorkspaceInvitationsByEmail({
      email: INVITEE_EMAIL,
    });

    expect(remainingInvitations).toHaveLength(1);
    expect(remainingInvitations[0].value).toBe(INVITATION_VALUE);
  });
});
