import { randomUUID } from 'crypto';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import {
  deleteWorkspaceInvitationsByEmail,
  findWorkspaceInvitationsByEmail,
  seedWorkspaceInvitation,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { signUpInWorkspaceOperationFactory } from 'test/integration/graphql/utils/sign-up-in-workspace-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

describe('signUpInWorkspace with a personal invitation for another email (integration)', () => {
  const invitedEmail = `invited-${randomUUID()}@example.com`;
  const inviteToken = `personal-invite-token-${randomUUID()}`;

  beforeAll(() =>
    seedWorkspaceInvitation({
      email: invitedEmail,
      value: inviteToken,
      expiresAt: new Date(Date.now() + ONE_HOUR_IN_MS),
    }),
  );

  afterAll(() => deleteWorkspaceInvitationsByEmail({ email: invitedEmail }));

  it('denies access when the email differs from the invited one', async () => {
    const response = await makeMetadataApiRequest(
      signUpInWorkspaceOperationFactory({
        email: `alias-${randomUUID()}@example.com`,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspacePersonalInviteToken: inviteToken,
      }),
      undefined,
    );

    expect(response.body.data?.signUpInWorkspace).toBeFalsy();
    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });
    expect(
      await findWorkspaceInvitationsByEmail({ email: invitedEmail }),
    ).toHaveLength(1);
  });
});
