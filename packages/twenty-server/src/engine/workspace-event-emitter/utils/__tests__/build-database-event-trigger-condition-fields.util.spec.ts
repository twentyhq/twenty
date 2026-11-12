import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { buildDatabaseEventTriggerConditionFields } from 'src/engine/workspace-event-emitter/utils/build-database-event-trigger-condition-fields.util';

const OBJECT_METADATA_ID = 'opportunity-object-id';

const STAGE = getFlatFieldMetadataMock({
  id: 'stage-id',
  universalIdentifier: 'opportunity-stage',
  objectMetadataId: OBJECT_METADATA_ID,
  type: FieldMetadataType.SELECT,
  name: 'stage',
});

const COMPANY = getFlatFieldMetadataMock({
  id: 'company-id',
  universalIdentifier: 'opportunity-company',
  objectMetadataId: OBJECT_METADATA_ID,
  type: FieldMetadataType.RELATION,
  name: 'company',
  settings: { relationType: RelationType.MANY_TO_ONE },
} as Parameters<typeof getFlatFieldMetadataMock>[0]);

const TASKS = getFlatFieldMetadataMock({
  id: 'tasks-id',
  universalIdentifier: 'opportunity-tasks',
  objectMetadataId: OBJECT_METADATA_ID,
  type: FieldMetadataType.RELATION,
  name: 'tasks',
  settings: { relationType: RelationType.ONE_TO_MANY },
} as Parameters<typeof getFlatFieldMetadataMock>[0]);

describe('buildDatabaseEventTriggerConditionFields', () => {
  it('should keep plain fields, read a many-to-one relation by its join column and drop one-to-many relations', () => {
    const flatFieldMetadataMaps = [STAGE, COMPANY, TASKS].reduce(
      (flatEntityMaps, flatEntity) =>
        addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
      createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
    );

    expect(
      buildDatabaseEventTriggerConditionFields({
        flatObjectMetadata: getFlatObjectMetadataMock({
          id: OBJECT_METADATA_ID,
          universalIdentifier: 'opportunity',
          fieldIds: [STAGE.id, COMPANY.id, TASKS.id],
        }),
        flatFieldMetadataMaps,
      }),
    ).toEqual([
      {
        name: 'stage',
        type: FieldMetadataType.SELECT,
        universalIdentifier: 'opportunity-stage',
      },
      {
        name: 'companyId',
        type: FieldMetadataType.UUID,
        universalIdentifier: 'opportunity-company',
      },
    ]);
  });
});
