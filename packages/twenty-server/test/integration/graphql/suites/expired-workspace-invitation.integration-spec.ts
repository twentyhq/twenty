import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
  seedWorkspaceInvitation,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { sendInvitationsOperationFactory } from 'test/integration/graphql/utils/send-invitations-operation-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

describe('sendInvitations expired invitation handling (integration)', () => {
  const sendInvitations = (email: string) =>
    makeMetadataAPIRequest(
      sendInvitationsOperationFactory({ emails: [email] }),
    );

  it('re-invites an email whose only existing invitation is expired', async () => {
    const email = `expired-invite-resend-${Date.now()}@example.com`;
    const staleToken = `expired-invite-resend-token-${Date.now()}`;

    await seedWorkspaceInvitation({
      email,
      value: staleToken,
      expiresAt: new Date(Date.now() - ONE_HOUR_IN_MS),
    });

    try {
      const response = await sendInvitations(email);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.sendInvitations.success).toBe(true);

      // The expired token must be replaced, not accumulated alongside the new one.
      const remainingTokens = await findWorkspaceInvitationsByEmail({ email });

      expect(remainingTokens).toHaveLength(1);
      expect(remainingTokens[0].value).not.toBe(staleToken);
      expect(new Date(remainingTokens[0].expiresAt).getTime()).toBeGreaterThan(
        Date.now(),
      );
    } finally {
      await deleteWorkspaceInvitationsByEmail({ email });
    }
  });

  it('still reports a valid invitation as already existing', async () => {
    const email = `valid-invite-resend-${Date.now()}@example.com`;

    await seedWorkspaceInvitation({
      email,
      value: `valid-invite-resend-token-${Date.now()}`,
      expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
    });

    try {
      const response = await sendInvitations(email);

      expect(response.body.data.sendInvitations.success).toBe(false);
    } finally {
      await deleteWorkspaceInvitationsByEmail({ email });
    }
  });
});
