import { FieldMetadataType, type ObjectPermissions } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { buildReadableFieldNames } from 'src/modules/timeline/utils/build-readable-field-names.util';

const PERSON_OBJECT = {
  id: 'person-object-id',
  fieldIds: ['job-title-field-id', 'city-field-id'],
};

const flatFieldMetadataMaps = [
  getFlatFieldMetadataMock({
    id: 'job-title-field-id',
    universalIdentifier: 'job-title-field-id',
    objectMetadataId: PERSON_OBJECT.id,
    type: FieldMetadataType.TEXT,
    name: 'jobTitle',
  }),
  getFlatFieldMetadataMock({
    id: 'city-field-id',
    universalIdentifier: 'city-field-id',
    objectMetadataId: PERSON_OBJECT.id,
    type: FieldMetadataType.TEXT,
    name: 'city',
  }),
].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

const buildObjectPermissions = (
  overrides: Partial<ObjectPermissions>,
): ObjectPermissions => ({
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
  ...overrides,
});

describe('buildReadableFieldNames', () => {
  it('should leave out the fields the role cannot read', () => {
    const readableFieldNames = buildReadableFieldNames({
      flatObjectMetadata: PERSON_OBJECT,
      isLinkedActivity: false,
      objectsPermissions: {
        [PERSON_OBJECT.id]: buildObjectPermissions({
          restrictedFields: {
            'job-title-field-id': { canRead: false, canUpdate: false },
          },
        }),
      },
      flatFieldMetadataMaps,
    });

    expect(readableFieldNames.has('city')).toBe(true);
    expect(readableFieldNames.has('jobTitle')).toBe(false);
  });

  it('should treat no field as readable when the role cannot read the linked object', () => {
    expect(
      buildReadableFieldNames({
        flatObjectMetadata: PERSON_OBJECT,
        isLinkedActivity: true,
        objectsPermissions: {
          [PERSON_OBJECT.id]: buildObjectPermissions({
            canReadObjectRecords: false,
          }),
        },
        flatFieldMetadataMaps,
      }).size,
    ).toBe(0);
  });

  it('should keep readable fields of a target object the role reads through sharing', () => {
    expect(
      buildReadableFieldNames({
        flatObjectMetadata: PERSON_OBJECT,
        isLinkedActivity: false,
        objectsPermissions: {
          [PERSON_OBJECT.id]: buildObjectPermissions({
            canReadObjectRecords: false,
          }),
        },
        flatFieldMetadataMaps,
      }).has('city'),
    ).toBe(true);
  });

  it('should not add a join column name for a non-relation field', () => {
    expect(
      buildReadableFieldNames({
        flatObjectMetadata: PERSON_OBJECT,
        isLinkedActivity: false,
        objectsPermissions: {
          [PERSON_OBJECT.id]: buildObjectPermissions({}),
        },
        flatFieldMetadataMaps,
      }).has('cityId'),
    ).toBe(false);
  });
});
