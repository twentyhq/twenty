import { randomUUID } from 'node:crypto';

import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { arrangeApiKeyWithPermissionFlags } from 'test/integration/graphql/utils/arrange-api-key-with-permission-flags.util';
import { arrangeMemberWithPermissionFlags } from 'test/integration/graphql/utils/arrange-member-with-permission-flags.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { findCurrentWorkspaceInviteHash } from 'test/integration/graphql/utils/find-current-workspace-invite-hash.util';
import { findWorkspaceInviteHashById } from 'test/integration/graphql/utils/find-workspace-invite-hash-by-id.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { PermissionFlagType } from 'twenty-shared/constants';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type CallerTestContext = {
  arrange: () => Promise<{ token: string; cleanup: () => Promise<void> }>;
};

const CALLERS_WITH_WORKSPACE_MEMBERS: EachTestingContext<CallerTestContext>[] =
  [
    {
      title: 'an admin',
      context: {
        arrange: async () => ({
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
          cleanup: async () => {},
        }),
      },
    },
    {
      title: 'a member whose role holds WORKSPACE_MEMBERS',
      context: {
        arrange: () =>
          arrangeMemberWithPermissionFlags({
            permissionFlagKeys: [PermissionFlagType.WORKSPACE_MEMBERS],
          }),
      },
    },
    {
      title: 'an API key whose role holds WORKSPACE_MEMBERS',
      context: {
        arrange: () =>
          arrangeApiKeyWithPermissionFlags({
            permissionFlagKeys: [PermissionFlagType.WORKSPACE_MEMBERS],
          }),
      },
    },
  ];

describe('Workspace invite hash read should succeed (integration)', () => {
  it.each(eachTestingContextFilter(CALLERS_WITH_WORKSPACE_MEMBERS))(
    'should return the invite hash to $title',
    async ({ context }) => {
      const caller = await context.arrange();

      try {
        const { data, errors } = await findCurrentWorkspaceInviteHash({
          token: caller.token,
          expectToFail: false,
        });

        expect(errors).toBeUndefined();
        expect(data.currentWorkspace).toEqual({
          id: SEED_APPLE_WORKSPACE_ID,
          inviteHash: await findWorkspaceInviteHashById(
            SEED_APPLE_WORKSPACE_ID,
          ),
        });
      } finally {
        await caller.cleanup();
      }
    },
  );

  it('should return the invite hash to the user who creates the workspace', async () => {
    const email = `invite-hash-read-${randomUUID()}@example.com`;
    const { data: signUpData } = await signUp({
      input: { email, password: 'Test123!@#' },
      expectToFail: false,
    });
    const workspaceAgnosticToken =
      signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    try {
      await globalThis.testDataSource.query(
        'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
        [email],
      );

      const {
        data: { signUpInNewWorkspace: newWorkspace },
      } = await signUpInNewWorkspace({
        accessToken: workspaceAgnosticToken,
        expectToFail: false,
      });
      const {
        data: { getAuthTokensFromLoginToken: authTokens },
      } = await getAuthTokensFromLoginToken({
        origin: newWorkspace.workspace.workspaceUrls.subdomainUrl,
        loginToken: newWorkspace.loginToken.token,
        expectToFail: false,
      });

      const { data, errors } = await activateWorkspace({
        accessToken: authTokens.tokens.accessOrWorkspaceAgnosticToken.token,
      });

      expect(errors).toBeUndefined();
      expect(data.activateWorkspace.inviteHash).toBe(
        await findWorkspaceInviteHashById(newWorkspace.workspace.id),
      );
    } finally {
      await deleteUser({
        accessToken: workspaceAgnosticToken,
        expectToFail: false,
      });
    }
  });
});
