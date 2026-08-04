import request from 'supertest';

import { AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

const client = request(`http://localhost:${APP_PORT}`);

const seedInvitation = ({
  email,
  value,
  expiresAt,
}: {
  email: string;
  value: string;
  expiresAt: Date;
}) =>
  testDataSource.query(
    `INSERT INTO core."appToken" ("workspaceId", "type", "value", "expiresAt", "context")
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [
      SEED_APPLE_WORKSPACE_ID,
      AppTokenType.InvitationToken,
      value,
      expiresAt.toISOString(),
      JSON.stringify({ email }),
    ],
  );

const removeSeededInvitations = (email: string) =>
  testDataSource.query(
    `DELETE FROM core."appToken" WHERE "workspaceId" = $1 AND context->>'email' = $2`,
    [SEED_APPLE_WORKSPACE_ID, email],
  );

describe('expired workspace invitation filtering', () => {
  describe('signUpInWorkspace with a personal invite token', () => {
    const email = `expired-invite-signup-${Date.now()}@example.com`;
    const token = `expired-invite-signup-token-${Date.now()}`;

    afterAll(() => removeSeededInvitations(email));

    it('denies access when the personal invitation is expired', async () => {
      await seedInvitation({
        email,
        value: token,
        expiresAt: new Date(Date.now() - ONE_HOUR_IN_MS),
      });

      await client
        .post('/metadata')
        .send({
          query: `
            mutation SignUpInWorkspace {
              signUpInWorkspace(
                email: "${email}"
                password: "Test123!@#"
                workspaceId: "${SEED_APPLE_WORKSPACE_ID}"
                workspacePersonalInviteToken: "${token}"
              ) {
                workspace {
                  id
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data?.signUpInWorkspace).toBeFalsy();
          expect(res.body.errors).toBeDefined();
        });
    });
  });

  describe('sendInvitations re-invite behaviour', () => {
    const sendInvitations = (email: string) =>
      client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `
            mutation SendInvitations {
              sendInvitations(emails: ["${email}"]) {
                success
              }
            }
          `,
        });

    it('re-invites an email whose only existing invitation is expired', async () => {
      const email = `expired-invite-resend-${Date.now()}@example.com`;

      await seedInvitation({
        email,
        value: `expired-invite-resend-token-${Date.now()}`,
        expiresAt: new Date(Date.now() - ONE_HOUR_IN_MS),
      });

      try {
        await sendInvitations(email)
          .expect(200)
          .expect((res) => {
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.sendInvitations.success).toBe(true);
          });
      } finally {
        await removeSeededInvitations(email);
      }
    });

    it('still reports a valid invitation as already existing', async () => {
      const email = `valid-invite-resend-${Date.now()}@example.com`;

      await seedInvitation({
        email,
        value: `valid-invite-resend-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
      });

      try {
        await sendInvitations(email)
          .expect(200)
          .expect((res) => {
            expect(res.body.data.sendInvitations.success).toBe(false);
          });
      } finally {
        await removeSeededInvitations(email);
      }
    });
  });
});
