import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { buildDirectRelationTargetShape } from 'src/modules/timeline/utils/build-direct-relation-target-shape.util';

const buildFlatEntityMaps = <TFlatEntity extends SyncableFlatEntity>(
  flatEntities: TFlatEntity[],
) =>
  addAllFlatEntitiesToFlatEntityMaps({
    flatEntities,
    flatEntityMaps: createEmptyFlatEntityMaps(),
  });

const ATTACHMENT_OBJECT = getFlatObjectMetadataMock({
  id: 'attachment-object',
  universalIdentifier: 'attachment-object-uid',
  nameSingular: 'attachment',
  fieldIds: ['target-person-field', 'target-company-field'],
});

const PERSON_OBJECT = getFlatObjectMetadataMock({
  id: 'person-object',
  universalIdentifier: 'person-object-uid',
  nameSingular: 'person',
  fieldIds: [],
});

const COMPANY_OBJECT = getFlatObjectMetadataMock({
  id: 'company-object',
  universalIdentifier: 'company-object-uid',
  nameSingular: 'company',
  fieldIds: [],
});

const TARGET_PERSON_FIELD = getFlatFieldMetadataMock({
  id: 'target-person-field',
  universalIdentifier: 'target-person-field-uid',
  name: 'targetPerson',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT.id,
  morphId: 'target-morph-id',
  relationTargetObjectMetadataId: PERSON_OBJECT.id,
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetPersonId',
  },
});

const TARGET_COMPANY_FIELD = getFlatFieldMetadataMock({
  id: 'target-company-field',
  universalIdentifier: 'target-company-field-uid',
  name: 'targetCompany',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT.id,
  morphId: 'target-morph-id',
  relationTargetObjectMetadataId: COMPANY_OBJECT.id,
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetCompanyId',
  },
});

const flatObjectMetadataMaps = buildFlatEntityMaps([
  ATTACHMENT_OBJECT,
  PERSON_OBJECT,
  COMPANY_OBJECT,
]);

const flatFieldMetadataMaps = buildFlatEntityMaps([
  TARGET_PERSON_FIELD,
  TARGET_COMPANY_FIELD,
]);

describe('buildDirectRelationTargetShape', () => {
  it('expands every target in a direct morph relation', () => {
    expect(
      buildDirectRelationTargetShape({
        relationFlatFieldMetadata: TARGET_PERSON_FIELD,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual({
      kind: 'DIRECT_RELATION',
      targetJoinColumns: [
        {
          joinColumnName: 'targetPersonId',
          targetObjectNameSingular: 'person',
        },
        {
          joinColumnName: 'targetCompanyId',
          targetObjectNameSingular: 'company',
        },
      ],
    });
  });

  it('does not treat a one-to-many field as a direct relation', () => {
    expect(
      buildDirectRelationTargetShape({
        relationFlatFieldMetadata: {
          ...TARGET_PERSON_FIELD,
          settings: { relationType: RelationType.ONE_TO_MANY },
        },
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toBeUndefined();
  });

  it('isolates incomplete morph metadata as an invalid target shape', () => {
    const objectMapsWithMissingMorphField = buildFlatEntityMaps([
      {
        ...ATTACHMENT_OBJECT,
        fieldIds: [...ATTACHMENT_OBJECT.fieldIds, 'missing-morph-field'],
      },
      PERSON_OBJECT,
      COMPANY_OBJECT,
    ]);

    expect(
      buildDirectRelationTargetShape({
        relationFlatFieldMetadata: TARGET_PERSON_FIELD,
        flatObjectMetadataMaps: objectMapsWithMissingMorphField,
        flatFieldMetadataMaps,
      }),
    ).toBeUndefined();
  });
});
