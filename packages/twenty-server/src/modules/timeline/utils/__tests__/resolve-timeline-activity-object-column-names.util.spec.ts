import {
  FieldMetadataType,
  type ObjectPermissions,
  RelationType,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { resolveTimelineActivityObjectColumnNames } from 'src/modules/timeline/utils/resolve-timeline-activity-object-column-names.util';

const TIMELINE_ACTIVITY_OBJECT = {
  id: 'timeline-activity-object-id',
  fieldIds: [
    'linked-object-metadata-id-field-id',
    'target-person-field-id',
    'properties-field-id',
  ],
};

const flatFieldMetadataMaps = [
  getFlatFieldMetadataMock({
    id: 'linked-object-metadata-id-field-id',
    universalIdentifier: 'linked-object-metadata-id-field-id',
    objectMetadataId: TIMELINE_ACTIVITY_OBJECT.id,
    type: FieldMetadataType.UUID,
    name: 'linkedObjectMetadataId',
  }),
  getFlatFieldMetadataMock({
    id: 'target-person-field-id',
    universalIdentifier: 'target-person-field-id',
    objectMetadataId: TIMELINE_ACTIVITY_OBJECT.id,
    type: FieldMetadataType.MORPH_RELATION,
    name: 'targetPerson',
    morphId: 'target-morph-id',
    relationTargetObjectMetadataId: 'person-object-id',
    settings: { relationType: RelationType.MANY_TO_ONE },
  }),
  getFlatFieldMetadataMock({
    id: 'properties-field-id',
    universalIdentifier: 'properties-field-id',
    objectMetadataId: TIMELINE_ACTIVITY_OBJECT.id,
    type: FieldMetadataType.RAW_JSON,
    name: 'properties',
  }),
].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

const buildObjectPermissions = (
  restrictedFields: ObjectPermissions['restrictedFields'],
): ObjectPermissions => ({
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields,
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
});

describe('resolveTimelineActivityObjectColumnNames', () => {
  it('should list the linked object column and the target join columns', () => {
    expect(
      resolveTimelineActivityObjectColumnNames({
        flatObjectMetadata: TIMELINE_ACTIVITY_OBJECT,
        objectsPermissions: {
          [TIMELINE_ACTIVITY_OBJECT.id]: buildObjectPermissions({}),
        },
        flatFieldMetadataMaps,
      }),
    ).toEqual(['linkedObjectMetadataId', 'targetPersonId']);
  });

  it('should leave out the columns the role cannot read', () => {
    expect(
      resolveTimelineActivityObjectColumnNames({
        flatObjectMetadata: TIMELINE_ACTIVITY_OBJECT,
        objectsPermissions: {
          [TIMELINE_ACTIVITY_OBJECT.id]: buildObjectPermissions({
            'target-person-field-id': { canRead: false, canUpdate: false },
          }),
        },
        flatFieldMetadataMaps,
      }),
    ).toEqual(['linkedObjectMetadataId']);
  });
});
