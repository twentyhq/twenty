import { PermissionFlagType } from 'twenty-shared/constants';
import { type ObjectRecordsPermissions } from 'twenty-shared/types';

import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { fromUserWorkspacePermissionsToUserWorkspacePermissionsDto } from 'src/engine/metadata-modules/role/utils/fromUserWorkspacePermissionsToUserWorkspacePermissionsDto';

const OBJECT_METADATA_ID = 'object-metadata-id';

const ALL_RECORDS = {
  canCreateAllRecords: true,
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
};

const buildPermissionFlags = () => {
  const permissionFlags = {} as Record<PermissionFlagType, boolean>;

  for (const permissionFlag of Object.values(PermissionFlagType)) {
    permissionFlags[permissionFlag] = false;
  }

  return permissionFlags;
};

const toDto = (objectRecordsPermissions: ObjectRecordsPermissions) =>
  fromUserWorkspacePermissionsToUserWorkspacePermissionsDto({
    recordsPermissions: {
      ...NO_ROLE_RECORDS_PERMISSIONS,
      objects: { [OBJECT_METADATA_ID]: objectRecordsPermissions },
    },
    permissionFlags: buildPermissionFlags(),
  }).objectRecordsPermissions?.[0];

describe('fromUserWorkspacePermissionsToUserWorkspacePermissionsDto', () => {
  it('should return empty lists for a cache entry written before the upgrade', () => {
    const cachedEntry: ObjectRecordsPermissions = JSON.parse(
      JSON.stringify({ ...ALL_RECORDS, restrictedFields: {} }),
    );

    expect(toDto(cachedEntry)).toMatchObject({
      unreadableFields: [],
      uneditableFields: [],
      restrictedFields: {},
    });
  });

  it('should keep restrictedFields for fronts cached before the deploy', () => {
    expect(
      toDto({
        ...ALL_RECORDS,
        unreadableFields: ['hidden-field-id'],
        uneditableFields: ['hidden-field-id', 'locked-field-id'],
      }),
    ).toMatchObject({
      unreadableFields: ['hidden-field-id'],
      uneditableFields: ['hidden-field-id', 'locked-field-id'],
      restrictedFields: {
        'hidden-field-id': { canRead: false, canUpdate: false },
        'locked-field-id': { canRead: null, canUpdate: false },
      },
    });
  });
});
