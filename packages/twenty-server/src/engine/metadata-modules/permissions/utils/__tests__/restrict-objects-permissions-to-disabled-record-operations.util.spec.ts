import { type ObjectPermissions } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { restrictObjectsPermissionsToDisabledRecordOperations } from 'src/engine/metadata-modules/permissions/utils/restrict-objects-permissions-to-disabled-record-operations.util';

const FULL_ACCESS: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const buildFlatObjectMetadataMaps = (
  disabledRecordOperations: FlatObjectMetadata['disabledRecordOperations'],
): FlatEntityMaps<FlatObjectMetadata> => ({
  byUniversalIdentifier: {
    'invoice-universal-identifier': {
      id: 'invoice',
      disabledRecordOperations,
    } as FlatObjectMetadata,
  },
  universalIdentifierById: { invoice: 'invoice-universal-identifier' },
  universalIdentifiersByApplicationId: {},
});

describe('restrictObjectsPermissionsToDisabledRecordOperations', () => {
  it('should turn off the permissions of disabled operations', () => {
    expect(
      restrictObjectsPermissionsToDisabledRecordOperations({
        objectsPermissions: { invoice: FULL_ACCESS },
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps([
          'update',
          'destroy',
        ]),
      }).invoice,
    ).toEqual({
      ...FULL_ACCESS,
      canUpdateObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  });

  it('should leave objects without disabled operations unchanged', () => {
    expect(
      restrictObjectsPermissionsToDisabledRecordOperations({
        objectsPermissions: { invoice: FULL_ACCESS },
        flatObjectMetadataMaps: buildFlatObjectMetadataMaps(null),
      }).invoice,
    ).toBe(FULL_ACCESS);
  });
});
