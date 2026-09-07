import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
  seedWorkspaceInvitation,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { resendWorkspaceInvitationOperationFactory } from 'test/integration/graphql/utils/resend-workspace-invitation-operation-factory.util';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const NON_ASSIGNABLE_ROLE_ID = '20202020-0000-4000-8000-000000000000';

describe('resendWorkspaceInvitation (integration)', () => {
  it('keeps the original invitation when the resend fails a pre-creation check', async () => {
    const email = `resend-preserves-invitation-${Date.now()}@example.com`;
    const value = `resend-preserves-invitation-token-${Date.now()}`;

    const appTokenId = await seedWorkspaceInvitation({
      email,
      value,
      expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
      roleId: NON_ASSIGNABLE_ROLE_ID,
    });

    try {
      const response = await makeMetadataAPIRequest(
        resendWorkspaceInvitationOperationFactory({ appTokenId }),
      );

      expect(response.body.errors).toBeDefined();

      const remainingTokens = await findWorkspaceInvitationsByEmail({ email });

      expect(remainingTokens).toHaveLength(1);
      expect(remainingTokens[0].value).toBe(value);
    } finally {
      await deleteWorkspaceInvitationsByEmail({ email });
    }
  });
});
