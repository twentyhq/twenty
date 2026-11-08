import { FeatureFlagKey } from 'twenty-shared/types';

import { followUpdateWhenCreatePermissionIsDisabled } from 'src/engine/permissions/internal/role/utils/follow-update-when-create-permission-is-disabled.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const OBJECT_METADATA_ID = 'object-metadata-id';

const recordsPermissions: RoleRecordsPermissions = {
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
  objects: {
    [OBJECT_METADATA_ID]: {
      canCreateAllRecords: false,
      canReadAllRecords: false,
      canUpdateAllRecords: false,
      canSoftDeleteAllRecords: false,
      canDestroyAllRecords: false,
      unreadableFields: [],
      uneditableFields: [],
      rowLevelRecordsPermissions: {
        canCreateRecords: false,
        canReadRecords: true,
        canUpdateRecords: true,
        canSoftDeleteRecords: true,
        canDestroyRecords: true,
        predicates: [],
        predicateGroups: [],
      },
    },
  },
};

describe('followUpdateWhenCreatePermissionIsDisabled', () => {
  it('should answer create with update when the flag is off', () => {
    const objectRecordsPermissions = followUpdateWhenCreatePermissionIsDisabled(
      { recordsPermissions, featureFlagsMap: {} },
    ).objects[OBJECT_METADATA_ID];

    expect(objectRecordsPermissions?.canCreateAllRecords).toBe(false);
    expect(
      objectRecordsPermissions?.rowLevelRecordsPermissions?.canCreateRecords,
    ).toBe(true);
  });

  it('should keep the create permission when the flag is on', () => {
    const objectRecordsPermissions = followUpdateWhenCreatePermissionIsDisabled(
      {
        recordsPermissions,
        featureFlagsMap: {
          [FeatureFlagKey.IS_CREATE_RECORDS_PERMISSION_ENABLED]: true,
        },
      },
    ).objects[OBJECT_METADATA_ID];

    expect(
      objectRecordsPermissions?.rowLevelRecordsPermissions?.canCreateRecords,
    ).toBe(false);
  });
});
