import { type ObjectRecordsPermissions } from 'twenty-shared/types';

import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const OBJECT_METADATA_ID = 'object-metadata-id';

const allRecords: ObjectRecordsPermissions = {
  canCreateAllRecords: true,
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
  restrictedFields: {},
};

const buildRole = (
  objectRecordsPermissions: ObjectRecordsPermissions,
): RoleRecordsPermissions => ({
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
  objects: { [OBJECT_METADATA_ID]: objectRecordsPermissions },
});

describe('isObjectUsingRecordAccessGroups', () => {
  it('should not use record access groups when no role has a rule on the object', () => {
    expect(
      isObjectUsingRecordAccessGroups({
        rolesPermissions: { admin: buildRole(allRecords) },
        objectMetadataId: OBJECT_METADATA_ID,
      }),
    ).toBe(false);
  });

  it('should use record access groups once one role has a rule on the object', () => {
    expect(
      isObjectUsingRecordAccessGroups({
        rolesPermissions: {
          admin: buildRole(allRecords),
          sales: buildRole({
            ...allRecords,
            canReadAllRecords: false,
            rowLevelRecordsPermissions: {
              canCreateRecords: false,
              canReadRecords: true,
              canUpdateRecords: false,
              canSoftDeleteRecords: false,
              canDestroyRecords: false,
              predicates: [],
              predicateGroups: [],
            },
          }),
        },
        objectMetadataId: OBJECT_METADATA_ID,
      }),
    ).toBe(true);
  });
});
