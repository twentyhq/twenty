import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildDirectRelationTargetShape } from 'src/modules/timeline/utils/build-direct-relation-target-shape.util';

type FlatEntityFixture = { id: string; universalIdentifier: string };

const buildFlatEntityMaps = <TEntity extends FlatEntityFixture>(
  flatEntities: TEntity[],
): FlatEntityMaps<never> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.universalIdentifier,
        flatEntity,
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      flatEntities.map((flatEntity) => [
        flatEntity.id,
        flatEntity.universalIdentifier,
      ]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatEntityMaps<never>;

const ATTACHMENT_OBJECT = {
  id: 'attachment-object',
  universalIdentifier: 'attachment-object-uid',
  nameSingular: 'attachment',
  fieldIds: ['target-person-field', 'target-company-field'],
};

const PERSON_OBJECT = {
  id: 'person-object',
  universalIdentifier: 'person-object-uid',
  nameSingular: 'person',
  fieldIds: [],
};

const COMPANY_OBJECT = {
  id: 'company-object',
  universalIdentifier: 'company-object-uid',
  nameSingular: 'company',
  fieldIds: [],
};

const TARGET_PERSON_FIELD = {
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
};

const TARGET_COMPANY_FIELD = {
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
};

const flatObjectMetadataMaps = buildFlatEntityMaps([
  ATTACHMENT_OBJECT,
  PERSON_OBJECT,
  COMPANY_OBJECT,
]) as unknown as FlatEntityMaps<FlatObjectMetadata>;

const flatFieldMetadataMaps = buildFlatEntityMaps([
  TARGET_PERSON_FIELD,
  TARGET_COMPANY_FIELD,
]) as unknown as FlatEntityMaps<FlatFieldMetadata>;

describe('buildDirectRelationTargetShape', () => {
  it('expands every target in a direct morph relation', () => {
    expect(
      buildDirectRelationTargetShape({
        relationFlatFieldMetadata:
          TARGET_PERSON_FIELD as unknown as FlatFieldMetadata,
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
        } as unknown as FlatFieldMetadata,
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
    ]) as unknown as FlatEntityMaps<FlatObjectMetadata>;

    expect(
      buildDirectRelationTargetShape({
        relationFlatFieldMetadata:
          TARGET_PERSON_FIELD as unknown as FlatFieldMetadata,
        flatObjectMetadataMaps: objectMapsWithMissingMorphField,
        flatFieldMetadataMaps,
      }),
    ).toBeUndefined();
  });
});
