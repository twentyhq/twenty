import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import {
  findPermissionsEphemeralRole,
  withPermissionsEphemeralRole,
} from 'src/engine/permissions/principal/storage/permissions-ephemeral-role.storage';

const EPHEMERAL_ROLE: PermissionScope = {
  objectsPermissions: {},
  permissionFlags: {},
};

const buildMemberAuthContext = (
  workspaceMemberId: string,
): PermissionsAuthContext => ({
  type: 'user',
  workspace: { id: 'workspace-id' },
  workspaceMemberId,
});

describe('permissions ephemeral role storage', () => {
  it('narrows the actor it was bound to, even through a copy of its auth context', async () => {
    const authContext = buildMemberAuthContext('member-id');

    await withPermissionsEphemeralRole(
      { authContext, ephemeralRole: EPHEMERAL_ROLE },
      async () => {
        expect(findPermissionsEphemeralRole({ ...authContext })).toBe(
          EPHEMERAL_ROLE,
        );
      },
    );
  });

  it('leaves checks on another member untouched', async () => {
    await withPermissionsEphemeralRole(
      {
        authContext: buildMemberAuthContext('member-id'),
        ephemeralRole: EPHEMERAL_ROLE,
      },
      async () => {
        expect(
          findPermissionsEphemeralRole(buildMemberAuthContext('other-id')),
        ).toBeUndefined();
      },
    );
  });

  it('applies nothing outside the bound call', () => {
    expect(
      findPermissionsEphemeralRole(buildMemberAuthContext('member-id')),
    ).toBeUndefined();
  });
});
