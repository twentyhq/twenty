import { type ObjectRecordsPermissions } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { PERMISSION_STORAGE_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/constants/permission-storage-object-universal-identifiers.constant';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const OBJECT_METADATA_ID = 'object-metadata-id';

const flatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: getFlatObjectMetadataMock({
    id: OBJECT_METADATA_ID,
    universalIdentifier: OBJECT_METADATA_ID,
  }),
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const allRecords: ObjectRecordsPermissions = {
  canCreateAllRecords: true,
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
  unreadableFields: [],
  uneditableFields: [],
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

const ROLE_WITH_RULE = buildRole({
  ...allRecords,
  canReadAllRecords: false,
  rowLevelRecordsPermissions: [
    {
      ruleId: 'rule-id',
      canCreateRecords: false,
      canReadRecords: true,
      canUpdateRecords: false,
      canSoftDeleteRecords: false,
      canDestroyRecords: false,
      predicates: [],
      predicateGroups: [],
      unreadableFields: [],
      uneditableFields: [],
    },
  ],
});

describe('isObjectUsingRecordAccessGroups', () => {
  it('should not use record access groups when no role has a rule on the object', () => {
    expect(
      isObjectUsingRecordAccessGroups({
        rolesPermissions: { admin: buildRole(allRecords) },
        flatObjectMetadataMaps,
        resolvedRelatedRecordPaths: [],
        objectMetadataId: OBJECT_METADATA_ID,
      }),
    ).toBe(false);
  });

  it('should use record access groups once one role has a rule on the object', () => {
    expect(
      isObjectUsingRecordAccessGroups({
        rolesPermissions: {
          admin: buildRole(allRecords),
          sales: ROLE_WITH_RULE,
        },
        flatObjectMetadataMaps,
        resolvedRelatedRecordPaths: [],
        objectMetadataId: OBJECT_METADATA_ID,
      }),
    ).toBe(true);
  });

  it('should not use record access groups on a permission storage object', () => {
    expect(
      isObjectUsingRecordAccessGroups({
        rolesPermissions: { sales: ROLE_WITH_RULE },
        flatObjectMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: getFlatObjectMetadataMock({
            id: OBJECT_METADATA_ID,
            universalIdentifier:
              PERMISSION_STORAGE_OBJECT_UNIVERSAL_IDENTIFIERS[0],
          }),
          flatEntityMaps: createEmptyFlatEntityMaps(),
        }),
        resolvedRelatedRecordPaths: [],
        objectMetadataId: OBJECT_METADATA_ID,
      }),
    ).toBe(false);
  });

  it('should not use record access groups on an object that no longer exists', () => {
    expect(
      isObjectUsingRecordAccessGroups({
        rolesPermissions: { sales: ROLE_WITH_RULE },
        flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
        resolvedRelatedRecordPaths: [],
        objectMetadataId: OBJECT_METADATA_ID,
      }),
    ).toBe(false);
  });
});
