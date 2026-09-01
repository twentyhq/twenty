import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildJunctionRelationTargetShape } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-junction-relation-target-shape.util';
import { junctionRelationTargetShapeTestFixtures } from 'src/engine/metadata-modules/flat-field-metadata/utils/__tests__/junction-relation-target-shape.test-fixtures';

const {
  buildFlatEntityMaps,
  COMPANY_OBJECT,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  NON_MORPH_JUNCTION_TARGET_FIELD,
  NOTE_OBJECT,
  NOTE_TARGET_COMPANY_FIELD,
  NOTE_TARGET_NOTE_FIELD,
  NOTE_TARGET_PERSON_FIELD,
  NOTE_TARGET_OBJECT,
  NOTE_TARGETS_FIELD,
  PERSON_JUNCTIONS_FIELD,
  PERSON_NOTE_TARGETS_FIELD,
  PERSON_OBJECT,
} = junctionRelationTargetShapeTestFixtures;

const buildShape = (relationFlatFieldMetadata: object) =>
  buildJunctionRelationTargetShape({
    relationFlatFieldMetadata:
      relationFlatFieldMetadata as unknown as FlatFieldMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

describe('buildJunctionRelationTargetShape', () => {
  it('should expand a morph junction target into every morph member', () => {
    expect(buildShape(NOTE_TARGETS_FIELD)).toEqual({
      kind: 'JUNCTION',
      junctionObjectMetadataId: NOTE_TARGET_OBJECT.id,
      junctionObjectNameSingular: 'noteTarget',
      junctionSourceJoinColumnName: 'noteId',
      targetJoinColumns: [
        {
          joinColumnName: 'targetPersonId',
          targetObjectMetadataId: PERSON_OBJECT.id,
          targetObjectNameSingular: 'person',
        },
        {
          joinColumnName: 'targetCompanyId',
          targetObjectMetadataId: COMPANY_OBJECT.id,
          targetObjectNameSingular: 'company',
        },
      ],
    });
  });

  it.each([
    {
      caseName: 'the morph group has only one member',
      junctionObject: {
        ...NOTE_TARGET_OBJECT,
        fieldIds: [NOTE_TARGET_NOTE_FIELD.id, NOTE_TARGET_PERSON_FIELD.id],
      },
      objectMetadata: [NOTE_OBJECT, PERSON_OBJECT, COMPANY_OBJECT],
      fieldMetadata: [
        NOTE_TARGETS_FIELD,
        NOTE_TARGET_NOTE_FIELD,
        NOTE_TARGET_PERSON_FIELD,
        PERSON_NOTE_TARGETS_FIELD,
      ],
    },
    {
      caseName: 'another morph member target object cannot be resolved',
      junctionObject: NOTE_TARGET_OBJECT,
      objectMetadata: [NOTE_OBJECT, PERSON_OBJECT],
      fieldMetadata: [
        NOTE_TARGETS_FIELD,
        NOTE_TARGET_NOTE_FIELD,
        NOTE_TARGET_PERSON_FIELD,
        NOTE_TARGET_COMPANY_FIELD,
        PERSON_NOTE_TARGETS_FIELD,
      ],
    },
  ])(
    'should keep the resolvable morph target column when $caseName',
    ({ junctionObject, objectMetadata, fieldMetadata }) => {
      expect(
        buildJunctionRelationTargetShape({
          relationFlatFieldMetadata:
            NOTE_TARGETS_FIELD as unknown as FlatFieldMetadata,
          flatObjectMetadataMaps: buildFlatEntityMaps([
            junctionObject,
            ...objectMetadata,
          ]) as unknown as FlatEntityMaps<FlatObjectMetadata>,
          flatFieldMetadataMaps: buildFlatEntityMaps(
            fieldMetadata,
          ) as unknown as FlatEntityMaps<FlatFieldMetadata>,
        }),
      ).toMatchObject({
        targetJoinColumns: [
          {
            joinColumnName: 'targetPersonId',
            targetObjectMetadataId: PERSON_OBJECT.id,
          },
        ],
      });
    },
  );

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

  it('should return undefined when the junction source does not point back to the relation', () => {
    expect(
      buildJunctionRelationTargetShape({
        relationFlatFieldMetadata:
          NOTE_TARGETS_FIELD as unknown as FlatFieldMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps: buildFlatEntityMaps([
          NOTE_TARGETS_FIELD,
          {
            ...NOTE_TARGET_NOTE_FIELD,
            relationTargetFieldMetadataId: 'another-note-field',
          },
          NOTE_TARGET_PERSON_FIELD,
          NOTE_TARGET_COMPANY_FIELD,
        ]) as unknown as FlatEntityMaps<FlatFieldMetadata>,
      }),
    ).toBeUndefined();
  });

  it('should return undefined when the configured junction target does not point back', () => {
    expect(
      buildJunctionRelationTargetShape({
        relationFlatFieldMetadata:
          NOTE_TARGETS_FIELD as unknown as FlatFieldMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps: buildFlatEntityMaps([
          NOTE_TARGETS_FIELD,
          NOTE_TARGET_NOTE_FIELD,
          {
            ...NOTE_TARGET_PERSON_FIELD,
            relationTargetFieldMetadataId: PERSON_JUNCTIONS_FIELD.id,
          },
          NOTE_TARGET_COMPANY_FIELD,
          PERSON_JUNCTIONS_FIELD,
        ]) as unknown as FlatEntityMaps<FlatFieldMetadata>,
      }),
    ).toBeUndefined();
  });

  it('should return undefined when the junction source and target are the same physical field', () => {
    expect(
      buildShape({
        ...NOTE_TARGETS_FIELD,
        settings: {
          relationType: RelationType.ONE_TO_MANY,
          junctionTargetFieldId: NOTE_TARGET_NOTE_FIELD.id,
        },
      }),
    ).toBeUndefined();
  });

  it('should return undefined when the junction source and target share a morph group', () => {
    expect(
      buildJunctionRelationTargetShape({
        relationFlatFieldMetadata:
          NOTE_TARGETS_FIELD as unknown as FlatFieldMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps: buildFlatEntityMaps([
          NOTE_TARGETS_FIELD,
          {
            ...NOTE_TARGET_NOTE_FIELD,
            type: FieldMetadataType.MORPH_RELATION,
            morphId: 'shared-source-target-morph-id',
          },
          {
            ...NOTE_TARGET_PERSON_FIELD,
            morphId: 'shared-source-target-morph-id',
          },
        ]) as unknown as FlatEntityMaps<FlatFieldMetadata>,
      }),
    ).toBeUndefined();
  });

  it('should not treat an inverse one to many morph field as a junction target', () => {
    expect(
      buildJunctionRelationTargetShape({
        relationFlatFieldMetadata:
          NOTE_TARGETS_FIELD as unknown as FlatFieldMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps: buildFlatEntityMaps([
          NOTE_TARGETS_FIELD,
          NOTE_TARGET_NOTE_FIELD,
          {
            ...NOTE_TARGET_PERSON_FIELD,
            settings: { relationType: RelationType.ONE_TO_MANY },
          },
          NOTE_TARGET_COMPANY_FIELD,
        ]) as unknown as FlatEntityMaps<FlatFieldMetadata>,
      }),
    ).toBeUndefined();
  });

  it('should build a single join column for a non morph junction target', () => {
    const shape = buildJunctionRelationTargetShape({
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
        PERSON_JUNCTIONS_FIELD,
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
          targetObjectMetadataId: PERSON_OBJECT.id,
          targetObjectNameSingular: 'person',
        },
      ],
    });
  });
});
