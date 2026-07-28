import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';

import { getObjectsPermissionsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-objects-permissions-from-role-permission-config.util';

const OBJECT_ID = 'object-1';

const agentRolePermissions = {
  [OBJECT_ID]: {
    canReadObjectRecords: true,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
};

const defaultRolePermissions = {
  [OBJECT_ID]: {
    canReadObjectRecords: false,
    canUpdateObjectRecords: false,
    canSoftDeleteObjectRecords: false,
    canDestroyObjectRecords: false,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
};

const rolesPermissions: ObjectsPermissionsByRoleId = {
  'agent-role-id': agentRolePermissions,
  'default-role-id': defaultRolePermissions,
};

describe('getObjectsPermissionsFromRolePermissionConfig', () => {
  it('should resolve a single union role', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        rolePermissionConfig: { unionOf: ['agent-role-id'] },
      }),
    ).toEqual(agentRolePermissions);
  });

  it('should resolve a single intersection role', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        rolePermissionConfig: { intersectionOf: ['default-role-id'] },
      }),
    ).toEqual(defaultRolePermissions);
  });

  it('should use the first role when multiple are provided', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        rolePermissionConfig: {
          intersectionOf: ['agent-role-id', 'default-role-id'],
        },
      }),
    ).toEqual(agentRolePermissions);
  });

  it('should return empty permissions when bypassing checks', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        rolePermissionConfig: { shouldBypassPermissionChecks: true },
      }),
    ).toEqual({});
  });

  it('should return empty permissions when the role is missing from the cache', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        rolePermissionConfig: { unionOf: ['missing-role-id'] },
      }),
    ).toEqual({});
  });
});
