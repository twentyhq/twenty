import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { resolveTimelineActivityObjectColumnNames } from 'src/modules/timeline/utils/resolve-timeline-activity-object-column-names.util';

const TIMELINE_ACTIVITY_OBJECT_ID = 'timeline-activity-object-id';

const flatFieldMetadataMaps = [
  getFlatFieldMetadataMock({
    id: 'target-person-field-id',
    universalIdentifier: 'target-person-field-id',
    objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
    type: FieldMetadataType.MORPH_RELATION,
    name: 'targetPerson',
    morphId: 'target-morph-id',
    relationTargetObjectMetadataId: 'person-object-id',
    settings: { relationType: RelationType.MANY_TO_ONE },
  }),
  getFlatFieldMetadataMock({
    id: 'properties-field-id',
    universalIdentifier: 'properties-field-id',
    objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
    type: FieldMetadataType.RAW_JSON,
    name: 'properties',
  }),
].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

describe('resolveTimelineActivityObjectColumnNames', () => {
  it('should list the linked object column and the target join columns', () => {
    expect(
      resolveTimelineActivityObjectColumnNames({
        flatObjectMetadata: {
          fieldIds: ['target-person-field-id', 'properties-field-id'],
        },
        flatFieldMetadataMaps,
      }),
    ).toEqual(['linkedObjectMetadataId', 'targetPersonId']);
  });
});
