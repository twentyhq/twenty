import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getObjectsPermissionsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-objects-permissions-from-role-permission-config.util';
import { type ApplicationDefaultRoleMaps } from 'src/engine/twenty-orm/types/application-default-role-maps.type';

const OBJECT_ID = 'object-1';

const EMPTY_FLAT_OBJECT_METADATA_MAPS: FlatEntityMaps<FlatObjectMetadata> =
  createEmptyFlatEntityMaps();
const EMPTY_APPLICATION_DEFAULT_ROLE_MAPS: ApplicationDefaultRoleMaps = {
  byId: {},
};

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
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: { agentRoleId: 'agent-role-id' },
        },
      }),
    ).toBe(agentRolePermissions);
  });

  it('should resolve a role held by several sources as that role alone', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: {
            userWorkspaceRoleId: 'default-role-id',
            applicationRoleId: 'default-role-id',
          },
        },
      }),
    ).toBe(defaultRolePermissions);
  });

  it('should intersect every role when several are provided', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: {
            agentRoleId: 'agent-role-id',
            userWorkspaceRoleId: 'default-role-id',
          },
        },
      }),
    ).toEqual(defaultRolePermissions);
  });

  it('should not grant a permission that only one of the roles allows', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: {
            userWorkspaceRoleId: 'default-role-id',
            applicationRoleId: 'agent-role-id',
          },
        },
      })[OBJECT_ID].canReadObjectRecords,
    ).toBe(false);
  });

  it('should deny when one of the intersected roles is missing from the cache', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: {
            agentRoleId: 'agent-role-id',
            applicationRoleId: 'missing-role-id',
          },
        },
      }),
    ).toEqual({});
  });

  it('should return empty permissions when bypassing checks', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: { shouldBypassPermissionChecks: true },
      }),
    ).toEqual({});
  });

  it('should return empty permissions when the role is missing from the cache', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: { apiKeyRoleId: 'missing-role-id' },
        },
      }),
    ).toEqual({});
  });

  it('should deny when an actor takes part without a role', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: {
          intersectionOf: {
            agentRoleId: null,
            userWorkspaceRoleId: 'agent-role-id',
          },
        },
      }),
    ).toEqual({});
  });

  it('should deny when no actor restricts the call', () => {
    expect(
      getObjectsPermissionsFromRolePermissionConfig({
        rolesPermissions,
        flatObjectMetadataMaps: EMPTY_FLAT_OBJECT_METADATA_MAPS,
        flatApplicationMaps: EMPTY_APPLICATION_DEFAULT_ROLE_MAPS,
        rolePermissionConfig: { intersectionOf: {} },
      }),
    ).toEqual({});
  });
});
