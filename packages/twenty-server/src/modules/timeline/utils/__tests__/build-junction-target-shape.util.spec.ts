import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildJunctionTargetShape } from 'src/modules/timeline/utils/build-junction-target-shape.util';

type FlatEntityFixture = { id: string; universalIdentifier: string };

const buildFlatEntityMaps = <T extends FlatEntityFixture>(
  flatEntities: T[],
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

const NOTE_OBJECT = {
  id: 'note-object',
  universalIdentifier: 'note-object-uid',
  nameSingular: 'note',
  fieldIds: ['note-targets-field'],
};

const NOTE_TARGET_OBJECT = {
  id: 'note-target-object',
  universalIdentifier: 'note-target-object-uid',
  nameSingular: 'noteTarget',
  fieldIds: [
    'note-target-note-field',
    'note-target-person-field',
    'note-target-company-field',
  ],
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

const NOTE_TARGETS_FIELD = {
  id: 'note-targets-field',
  universalIdentifier: 'note-targets-field-uid',
  name: 'noteTargets',
  type: FieldMetadataType.RELATION,
  objectMetadataId: NOTE_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: NOTE_TARGET_OBJECT.id,
  relationTargetFieldMetadataId: 'note-target-note-field',
  settings: {
    relationType: RelationType.ONE_TO_MANY,
    junctionTargetFieldId: 'note-target-person-field',
  },
};

const NOTE_TARGET_NOTE_FIELD = {
  id: 'note-target-note-field',
  universalIdentifier: 'note-target-note-field-uid',
  name: 'note',
  type: FieldMetadataType.RELATION,
  objectMetadataId: NOTE_TARGET_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: NOTE_OBJECT.id,
  relationTargetFieldMetadataId: NOTE_TARGETS_FIELD.id,
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'noteId',
  },
};

const NOTE_TARGET_PERSON_FIELD = {
  id: 'note-target-person-field',
  universalIdentifier: 'note-target-person-field-uid',
  name: 'targetPerson',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: NOTE_TARGET_OBJECT.id,
  morphId: 'target-morph-id',
  relationTargetObjectMetadataId: PERSON_OBJECT.id,
  relationTargetFieldMetadataId: 'person-note-targets-field',
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetPersonId',
  },
};

const NOTE_TARGET_COMPANY_FIELD = {
  id: 'note-target-company-field',
  universalIdentifier: 'note-target-company-field-uid',
  name: 'targetCompany',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: NOTE_TARGET_OBJECT.id,
  morphId: 'target-morph-id',
  relationTargetObjectMetadataId: COMPANY_OBJECT.id,
  relationTargetFieldMetadataId: 'company-note-targets-field',
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetCompanyId',
  },
};

const NON_MORPH_JUNCTION_TARGET_FIELD = {
  id: 'junction-person-field',
  universalIdentifier: 'junction-person-field-uid',
  name: 'person',
  type: FieldMetadataType.RELATION,
  objectMetadataId: NOTE_TARGET_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: PERSON_OBJECT.id,
  relationTargetFieldMetadataId: 'person-junctions-field',
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'personId',
  },
};

const flatObjectMetadataMaps = buildFlatEntityMaps([
  NOTE_OBJECT,
  NOTE_TARGET_OBJECT,
  PERSON_OBJECT,
  COMPANY_OBJECT,
]) as unknown as FlatEntityMaps<FlatObjectMetadata>;

const flatFieldMetadataMaps = buildFlatEntityMaps([
  NOTE_TARGETS_FIELD,
  NOTE_TARGET_NOTE_FIELD,
  NOTE_TARGET_PERSON_FIELD,
  NOTE_TARGET_COMPANY_FIELD,
]) as unknown as FlatEntityMaps<FlatFieldMetadata>;

const buildShape = (relationFlatFieldMetadata: object) =>
  buildJunctionTargetShape({
    relationFlatFieldMetadata:
      relationFlatFieldMetadata as unknown as FlatFieldMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

describe('buildJunctionTargetShape', () => {
  it('should expand a morph junction target into every morph member', () => {
    expect(buildShape(NOTE_TARGETS_FIELD)).toEqual({
      kind: 'JUNCTION',
      junctionObjectMetadataId: NOTE_TARGET_OBJECT.id,
      junctionObjectNameSingular: 'noteTarget',
      junctionSourceJoinColumnName: 'noteId',
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

  it('should return undefined when the relation declares no junction target', () => {
    expect(
      buildShape({
        ...NOTE_TARGETS_FIELD,
        settings: { relationType: RelationType.ONE_TO_MANY },
      }),
    ).toBeUndefined();
  });

  it('should return undefined for a many to one relation', () => {
    expect(buildShape(NOTE_TARGET_NOTE_FIELD)).toBeUndefined();
  });

  it('should build a single join column for a non morph junction target', () => {
    const shape = buildJunctionTargetShape({
      relationFlatFieldMetadata: {
        ...NOTE_TARGETS_FIELD,
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          junctionTargetFieldId: NON_MORPH_JUNCTION_TARGET_FIELD.id,
        },
      } as unknown as FlatFieldMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: buildFlatEntityMaps([
        NOTE_TARGETS_FIELD,
        NOTE_TARGET_NOTE_FIELD,
        NON_MORPH_JUNCTION_TARGET_FIELD,
      ]) as unknown as FlatEntityMaps<FlatFieldMetadata>,
    });

    expect(shape).toEqual({
      kind: 'JUNCTION',
      junctionObjectMetadataId: NOTE_TARGET_OBJECT.id,
      junctionObjectNameSingular: 'noteTarget',
      junctionSourceJoinColumnName: 'noteId',
      targetJoinColumns: [
        {
          joinColumnName: 'personId',
          targetObjectNameSingular: 'person',
        },
      ],
    });
  });
});
