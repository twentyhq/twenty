import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { sendInvitationsOperationFactory } from 'test/integration/graphql/utils/send-invitations-operation-factory.util';
import { signUpInWorkspaceOperationFactory } from 'test/integration/graphql/utils/sign-up-in-workspace-operation-factory.util';

import { AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

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

      const response = await makeMetadataAPIRequest(
        signUpInWorkspaceOperationFactory({
          email,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          workspacePersonalInviteToken: token,
        }),
        undefined,
      );

      expect(response.body.data?.signUpInWorkspace).toBeFalsy();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('sendInvitations re-invite behaviour', () => {
    const sendInvitations = (email: string) =>
      makeMetadataAPIRequest(
        sendInvitationsOperationFactory({ emails: [email] }),
      );

    it('re-invites an email whose only existing invitation is expired', async () => {
      const email = `expired-invite-resend-${Date.now()}@example.com`;

      await seedInvitation({
        email,
        value: `expired-invite-resend-token-${Date.now()}`,
        expiresAt: new Date(Date.now() - ONE_HOUR_IN_MS),
      });

      try {
        const response = await sendInvitations(email);

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.sendInvitations.success).toBe(true);
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
        const response = await sendInvitations(email);

        expect(response.body.data.sendInvitations.success).toBe(false);
      } finally {
        await removeSeededInvitations(email);
      }
    });
  });
});
