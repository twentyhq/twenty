import { PermissionFlagType } from 'twenty-shared/constants';

import { fromUserWorkspacePermissionsToUserWorkspacePermissionsDto } from 'src/engine/metadata-modules/role/utils/fromUserWorkspacePermissionsToUserWorkspacePermissionsDto';

const buildPermissionFlags = (
  grantedPermissionFlags: PermissionFlagType[],
): Record<PermissionFlagType, boolean> =>
  Object.fromEntries(
    Object.values(PermissionFlagType).map((permissionFlag) => [
      permissionFlag,
      grantedPermissionFlags.includes(permissionFlag),
    ]),
  ) as Record<PermissionFlagType, boolean>;

const getSortedPermissionFlags = (
  grantedPermissionFlags: PermissionFlagType[],
): string[] =>
  [
    ...(fromUserWorkspacePermissionsToUserWorkspacePermissionsDto({
      permissionFlags: buildPermissionFlags(grantedPermissionFlags),
      objectsPermissions: {},
    }).permissionFlags ?? []),
  ].sort();

describe('fromUserWorkspacePermissionsToUserWorkspacePermissionsDto', () => {
  it('lists only the granted permission flags', () => {
    expect(
      getSortedPermissionFlags([
        PermissionFlagType.ROLES,
        PermissionFlagType.DATA_MODEL,
      ]),
    ).toEqual([PermissionFlagType.DATA_MODEL, PermissionFlagType.ROLES]);
  });

  it.each([
    [PermissionFlagType.USER_APPS, 'CONNECTED_ACCOUNTS'],
    [PermissionFlagType.WORKSPACE_APPS, 'APPLICATIONS'],
  ])(
    'upgrade:2-53:rename-app-permission-flag-keys also reports a granted %s under its previous key %s',
    (permissionFlag, previousKey) => {
      expect(getSortedPermissionFlags([permissionFlag])).toEqual(
        [permissionFlag, previousKey].sort(),
      );
    },
  );
});
