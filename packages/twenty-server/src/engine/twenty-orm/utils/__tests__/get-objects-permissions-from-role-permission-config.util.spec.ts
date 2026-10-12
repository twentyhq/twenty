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
  it('should resolve a single role unchanged', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        rolePermissionConfig: { intersectionOf: { agent: 'agent-role-id' } },
      }),
    ).toBe(agentRolePermissions);
  });

  it('should resolve a role held by several sources as that role alone', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        rolePermissionConfig: {
          intersectionOf: {
            userWorkspace: 'default-role-id',
            application: 'default-role-id',
          },
        },
      }),
    ).toBe(defaultRolePermissions);
  });

  it('should intersect every role when several are provided', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        rolePermissionConfig: {
          intersectionOf: {
            agent: 'agent-role-id',
            userWorkspace: 'default-role-id',
          },
        },
      }),
    ).toEqual(defaultRolePermissions);
  });

  it('should not grant a permission that only one of the roles allows', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        rolePermissionConfig: {
          intersectionOf: {
            userWorkspace: 'default-role-id',
            application: 'agent-role-id',
          },
        },
      })[OBJECT_ID].canReadObjectRecords,
    ).toBe(false);
  });

  it('should deny when one of the intersected roles is missing from the cache', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        rolePermissionConfig: {
          intersectionOf: {
            agent: 'agent-role-id',
            application: 'missing-role-id',
          },
        },
      }),
    ).toEqual({});
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
        rolePermissionConfig: { intersectionOf: { apiKey: 'missing-role-id' } },
      }),
    ).toEqual({});
  });

  it('should deny when an actor takes part without a role', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        rolePermissionConfig: {
          intersectionOf: { agent: null, userWorkspace: 'agent-role-id' },
        },
      }),
    ).toEqual({});
  });

  it('should deny when no actor restricts the call', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        rolePermissionConfig: { intersectionOf: {} },
      }),
    ).toEqual({});
  });
});
