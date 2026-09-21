import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import {
  deleteWorkspaceInvitationsByEmail,
  seedWorkspaceInvitation,
} from 'test/integration/graphql/utils/seed-workspace-invitation.util';
import { signUpInWorkspaceOperationFactory } from 'test/integration/graphql/utils/sign-up-in-workspace-operation-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

describe('signUpInWorkspace with an expired personal invitation (integration)', () => {
  const email = `expired-invite-signup-${Date.now()}@example.com`;
  const token = `expired-invite-signup-token-${Date.now()}`;

  beforeAll(() =>
    seedWorkspaceInvitation({
      email,
      value: token,
      expiresAt: new Date(Date.now() - ONE_HOUR_IN_MS),
    }),
  );

  afterAll(() => deleteWorkspaceInvitationsByEmail({ email }));

  it('denies access when the personal invitation is expired', async () => {
    const response = await makeMetadataAPIRequest(
      signUpInWorkspaceOperationFactory({
        email,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspacePersonalInviteToken: token,
      }),
      undefined,
    );

    expect(response.body.data?.signUpInWorkspace).toBeFalsy();
    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });
  });
});
