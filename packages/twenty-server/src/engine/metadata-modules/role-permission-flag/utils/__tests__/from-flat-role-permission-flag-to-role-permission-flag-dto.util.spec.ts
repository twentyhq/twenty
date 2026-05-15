import { PermissionFlagType } from 'twenty-shared/constants';

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
): FlatRolePermissionFlag =>
  ({
    id: 'role-permission-flag-id',
    roleId: 'role-id',
    permissionFlagUniversalIdentifier: 'permission-flag-universal-id',
    ...overrides,
  }) as FlatRolePermissionFlag;

const buildFlatPermissionFlag = (): FlatPermissionFlag => ({
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
});

const buildFlatPermissionFlagMaps = (): FlatPermissionFlagMaps => ({
  byUniversalIdentifier: {
    'permission-flag-universal-id': buildFlatPermissionFlag(),
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
