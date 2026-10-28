import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';

import { type FlatPermissionFlagMaps } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag-maps.type';
import { type FlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag.type';
import { type FlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { fromFlatRolePermissionFlagToRolePermissionFlagDto } from 'src/engine/metadata-modules/role-permission-flag/utils/from-flat-role-permission-flag-to-role-permission-flag-dto.util';

const buildFlatRolePermissionFlag = (
  overrides: Partial<FlatRolePermissionFlag> = {},
): FlatRolePermissionFlag => ({
  id: 'role-permission-flag-id',
  universalIdentifier: 'role-permission-flag-universal-id',
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-id',
  roleId: 'role-id',
  roleUniversalIdentifier: 'role-universal-id',
  permissionFlagId: 'permission-flag-id',
  permissionFlagUniversalIdentifier: 'permission-flag-universal-id',
  createdAt: '2026-05-13T00:00:00.000Z',
  updatedAt: '2026-05-13T00:00:00.000Z',
  ...overrides,
});

const buildFlatPermissionFlag = (
  overrides: Partial<FlatPermissionFlag> = {},
): FlatPermissionFlag => ({
  id: 'permission-flag-id',
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  universalIdentifier: 'permission-flag-universal-id',
  applicationUniversalIdentifier: 'application-universal-id',
  key: PermissionFlagType.WORKSPACE,
  label: 'Workspace',
  description: null,
  icon: null,
  permissionType: 'settings',
  rolePermissionFlagIds: [],
  rolePermissionFlagUniversalIdentifiers: [],
  createdAt: '2026-05-13T00:00:00.000Z',
  updatedAt: '2026-05-13T00:00:00.000Z',
  ...overrides,
});

const buildFlatPermissionFlagMaps = (
  flatPermissionFlag: FlatPermissionFlag = buildFlatPermissionFlag(),
): FlatPermissionFlagMaps => ({
  byUniversalIdentifier: {
    'permission-flag-universal-id': flatPermissionFlag,
  },
  universalIdentifierById: {
    'permission-flag-id': 'permission-flag-universal-id',
  },
  universalIdentifiersByApplicationId: {},
});

describe('fromFlatRolePermissionFlagToRolePermissionFlagDto', () => {
  it('maps role permission flags to the public permission flag DTO shape', () => {
    expect(
      fromFlatRolePermissionFlagToRolePermissionFlagDto(
        buildFlatRolePermissionFlag(),
        buildFlatPermissionFlagMaps(),
      ),
    ).toEqual({
      id: 'role-permission-flag-id',
      roleId: 'role-id',
      flag: PermissionFlagType.WORKSPACE,
    });
  });

  it('upgrade:2-53:rename-app-permission-flag-keys exposes the code key of a standard flag stored under a different key', () => {
    expect(
      fromFlatRolePermissionFlagToRolePermissionFlagDto(
        buildFlatRolePermissionFlag(),
        buildFlatPermissionFlagMaps(
          buildFlatPermissionFlag({
            universalIdentifier: SystemPermissionFlag.CONNECTED_ACCOUNTS,
            key: 'USER_APPS',
          }),
        ),
      ).flag,
    ).toBe(PermissionFlagType.CONNECTED_ACCOUNTS);
  });

  it('exposes the stored key of an app-defined flag', () => {
    expect(
      fromFlatRolePermissionFlagToRolePermissionFlagDto(
        buildFlatRolePermissionFlag(),
        buildFlatPermissionFlagMaps(
          buildFlatPermissionFlag({ key: 'CAN_EXPORT_INVOICES' }),
        ),
      ).flag,
    ).toBe('CAN_EXPORT_INVOICES');
  });

  it('throws a permissions exception when the permission flag is missing', () => {
    expect(() =>
      fromFlatRolePermissionFlagToRolePermissionFlagDto(
        buildFlatRolePermissionFlag(),
        {
          byUniversalIdentifier: {},
          universalIdentifierById: {},
          universalIdentifiersByApplicationId: {},
        },
      ),
    ).toThrow(
      new PermissionsException(
        'Permission flag permission-flag-universal-id not found',
        PermissionsExceptionCode.PERMISSION_NOT_FOUND,
      ),
    );
  });
});
