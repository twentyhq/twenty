import { arrangeApiKeyWithPermissionFlags } from 'test/integration/graphql/utils/arrange-api-key-with-permission-flags.util';
import { arrangeApplicationTokenWithPermissionFlags } from 'test/integration/graphql/utils/arrange-application-token-with-permission-flags.util';
import { arrangeMemberWithPermissionFlags } from 'test/integration/graphql/utils/arrange-member-with-permission-flags.util';
import { findCurrentWorkspaceInviteHash } from 'test/integration/graphql/utils/find-current-workspace-invite-hash.util';
import { findWorkspaceInviteHashById } from 'test/integration/graphql/utils/find-workspace-invite-hash-by-id.util';
import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type CallerTestContext = {
  arrange: () => Promise<{ token: string; cleanup: () => Promise<void> }>;
};

const CALLERS_REFUSED_THE_INVITE_HASH: EachTestingContext<CallerTestContext>[] =
  [
    {
      title: 'an API key whose role lacks WORKSPACE_MEMBERS',
      context: {
        arrange: () =>
          arrangeApiKeyWithPermissionFlags({
            permissionFlagKeys: [PermissionFlagType.WORKSPACE],
          }),
      },
    },
    {
      title: 'a member whose role lacks WORKSPACE_MEMBERS',
      context: {
        arrange: () =>
          arrangeMemberWithPermissionFlags({
            permissionFlagKeys: [PermissionFlagType.WORKSPACE],
          }),
      },
    },
    {
      title:
        'an application token without user binding, whose role holds WORKSPACE_MEMBERS',
      context: {
        arrange: () =>
          arrangeApplicationTokenWithPermissionFlags({
            permissionFlagUniversalIdentifiers: [
              SystemPermissionFlag.WORKSPACE_MEMBERS,
            ],
            isUserBound: false,
          }),
      },
    },
    {
      title:
        'an application token bound to an admin, whose role holds WORKSPACE_MEMBERS',
      context: {
        arrange: () =>
          arrangeApplicationTokenWithPermissionFlags({
            permissionFlagUniversalIdentifiers: [
              SystemPermissionFlag.WORKSPACE_MEMBERS,
            ],
            isUserBound: true,
          }),
      },
    },
  ];

describe('Workspace invite hash read should fail (integration)', () => {
  it.each(eachTestingContextFilter(CALLERS_REFUSED_THE_INVITE_HASH))(
    'should return a null invite hash without an error to $title',
    async ({ context }) => {
      const caller = await context.arrange();

      try {
        const inviteHash = await findWorkspaceInviteHashById(
          SEED_APPLE_WORKSPACE_ID,
        );
        const { data, errors } = await findCurrentWorkspaceInviteHash({
          token: caller.token,
          expectToFail: false,
        });

        expect(errors).toBeUndefined();
        expect(data.currentWorkspace).toEqual({
          id: SEED_APPLE_WORKSPACE_ID,
          inviteHash: null,
        });
        expect(JSON.stringify(data)).not.toContain(inviteHash);
      } finally {
        await caller.cleanup();
      }
    },
  );
});
