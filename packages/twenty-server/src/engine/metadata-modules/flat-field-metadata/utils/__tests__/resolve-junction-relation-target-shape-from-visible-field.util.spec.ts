import { RelationType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { junctionRelationTargetShapeTestFixtures } from 'src/engine/metadata-modules/flat-field-metadata/utils/__tests__/junction-relation-target-shape.test-fixtures';
import { resolveJunctionRelationTargetShapeFromVisibleField } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-junction-relation-target-shape-from-visible-field.util';

const {
  buildFlatEntityMaps,
  COMPANY_NOTE_TARGETS_FIELD,
  COMPANY_OBJECT,
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

type FlatEntityFixture = { id: string; universalIdentifier: string };

const resolveVisibleShape = ({
  relationFlatFieldMetadata,
  fieldMetadata = [
    NOTE_TARGETS_FIELD,
    NOTE_TARGET_NOTE_FIELD,
    NOTE_TARGET_PERSON_FIELD,
    NOTE_TARGET_COMPANY_FIELD,
    PERSON_NOTE_TARGETS_FIELD,
    COMPANY_NOTE_TARGETS_FIELD,
  ],
}: {
  relationFlatFieldMetadata: object;
  fieldMetadata?: object[];
}) =>
  resolveJunctionRelationTargetShapeFromVisibleField({
    relationFlatFieldMetadata:
      relationFlatFieldMetadata as unknown as FlatFieldMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps: buildFlatEntityMaps(
      fieldMetadata as FlatEntityFixture[],
    ) as unknown as FlatEntityMaps<FlatFieldMetadata>,
  });

describe('resolveJunctionRelationTargetShapeFromVisibleField', () => {
  it('keeps an owning junction field orientation unchanged', () => {
    expect(
      resolveVisibleShape({ relationFlatFieldMetadata: NOTE_TARGETS_FIELD }),
    ).toEqual({
      kind: 'JUNCTION',
      junctionObjectMetadataId: NOTE_TARGET_OBJECT.id,
      junctionObjectNameSingular: NOTE_TARGET_OBJECT.nameSingular,
      junctionSourceJoinColumnName: 'noteId',
      isTargetMorphRelation: true,
      targetJoinColumns: [
        {
          joinColumnName: 'targetPersonId',
          targetObjectMetadataId: PERSON_OBJECT.id,
          targetObjectNameSingular: PERSON_OBJECT.nameSingular,
        },
        {
          joinColumnName: 'targetCompanyId',
          targetObjectMetadataId: COMPANY_OBJECT.id,
          targetObjectNameSingular: COMPANY_OBJECT.nameSingular,
        },
      ],
    });
  });

  it.each([
    {
      entryPoint: 'owning',
      relationFlatFieldMetadata: NOTE_TARGETS_FIELD,
    },
    {
      entryPoint: 'reverse',
      relationFlatFieldMetadata: COMPANY_NOTE_TARGETS_FIELD,
    },
  ])(
    'fails closed on a non-reciprocal configured target through the $entryPoint field',
    ({ relationFlatFieldMetadata }) => {
      expect(
        resolveVisibleShape({
          relationFlatFieldMetadata,
          fieldMetadata: [
            NOTE_TARGETS_FIELD,
            NOTE_TARGET_NOTE_FIELD,
            {
              ...NOTE_TARGET_PERSON_FIELD,
              relationTargetFieldMetadataId: 'another-person-field',
            },
            NOTE_TARGET_COMPANY_FIELD,
            PERSON_NOTE_TARGETS_FIELD,
            COMPANY_NOTE_TARGETS_FIELD,
          ],
        }),
      ).toBeUndefined();
    },
  );

  it('orients a reverse regular junction from the visible source field', () => {
    const regularOwningField = {
      ...NOTE_TARGETS_FIELD,
      settings: {
        relationType: RelationType.ONE_TO_MANY,
        junctionTargetFieldId: NON_MORPH_JUNCTION_TARGET_FIELD.id,
      },
    };

    expect(
      resolveVisibleShape({
        relationFlatFieldMetadata: PERSON_JUNCTIONS_FIELD,
        fieldMetadata: [
          regularOwningField,
          NOTE_TARGET_NOTE_FIELD,
          NON_MORPH_JUNCTION_TARGET_FIELD,
          PERSON_JUNCTIONS_FIELD,
        ],
      }),
    ).toEqual({
      kind: 'JUNCTION',
      junctionObjectMetadataId: NOTE_TARGET_OBJECT.id,
      junctionObjectNameSingular: NOTE_TARGET_OBJECT.nameSingular,
      junctionSourceJoinColumnName: 'personId',
      isTargetMorphRelation: false,
      targetJoinColumns: [
        {
          joinColumnName: 'noteId',
          targetObjectMetadataId: NOTE_OBJECT.id,
          targetObjectNameSingular: NOTE_OBJECT.nameSingular,
        },
      ],
    });
  });

  it('matches a reverse physical morph member to the declared morph owner', () => {
    expect(
      resolveVisibleShape({
        relationFlatFieldMetadata: COMPANY_NOTE_TARGETS_FIELD,
      }),
    ).toEqual({
      kind: 'JUNCTION',
      junctionObjectMetadataId: NOTE_TARGET_OBJECT.id,
      junctionObjectNameSingular: NOTE_TARGET_OBJECT.nameSingular,
      junctionSourceJoinColumnName: 'targetCompanyId',
      isTargetMorphRelation: false,
      targetJoinColumns: [
        {
          joinColumnName: 'noteId',
          targetObjectMetadataId: NOTE_OBJECT.id,
          targetObjectNameSingular: NOTE_OBJECT.nameSingular,
        },
      ],
    });
  });

  it('fails closed when the visible reverse edge is not reciprocal', () => {
    expect(
      resolveVisibleShape({
        relationFlatFieldMetadata: COMPANY_NOTE_TARGETS_FIELD,
        fieldMetadata: [
          NOTE_TARGETS_FIELD,
          NOTE_TARGET_NOTE_FIELD,
          NOTE_TARGET_PERSON_FIELD,
          {
            ...NOTE_TARGET_COMPANY_FIELD,
            relationTargetFieldMetadataId: 'another-company-field',
          },
          COMPANY_NOTE_TARGETS_FIELD,
        ],
      }),
    ).toBeUndefined();
  });

  it('does not reinterpret a malformed declared owner as a reverse field', () => {
    expect(
      resolveVisibleShape({
        relationFlatFieldMetadata: {
          ...COMPANY_NOTE_TARGETS_FIELD,
          settings: {
            relationType: RelationType.ONE_TO_MANY,
            junctionTargetFieldId: 'missing-target-field',
          },
        },
      }),
    ).toBeUndefined();
  });

  it('fails closed when two owners declare the visible target group', () => {
    const duplicateOwnerField = {
      ...NOTE_TARGETS_FIELD,
      id: 'duplicate-note-targets-field',
      universalIdentifier: 'duplicate-note-targets-field-uid',
      relationTargetFieldMetadataId: 'duplicate-note-source-field',
    };
    const duplicateSourceField = {
      ...NOTE_TARGET_NOTE_FIELD,
      id: 'duplicate-note-source-field',
      universalIdentifier: 'duplicate-note-source-field-uid',
      relationTargetFieldMetadataId: duplicateOwnerField.id,
    };

    expect(
      resolveVisibleShape({
        relationFlatFieldMetadata: COMPANY_NOTE_TARGETS_FIELD,
        fieldMetadata: [
          NOTE_TARGETS_FIELD,
          NOTE_TARGET_NOTE_FIELD,
          duplicateOwnerField,
          duplicateSourceField,
          NOTE_TARGET_PERSON_FIELD,
          NOTE_TARGET_COMPANY_FIELD,
          COMPANY_NOTE_TARGETS_FIELD,
        ],
      }),
    ).toBeUndefined();
  });

  it('counts a malformed declaration in the visible target group as ambiguous', () => {
    const malformedOwnerField = {
      ...NOTE_TARGETS_FIELD,
      id: 'malformed-note-targets-field',
      universalIdentifier: 'malformed-note-targets-field-uid',
      relationTargetFieldMetadataId: 'missing-source-field',
    };

    expect(
      resolveVisibleShape({
        relationFlatFieldMetadata: COMPANY_NOTE_TARGETS_FIELD,
        fieldMetadata: [
          NOTE_TARGETS_FIELD,
          NOTE_TARGET_NOTE_FIELD,
          malformedOwnerField,
          NOTE_TARGET_PERSON_FIELD,
          NOTE_TARGET_COMPANY_FIELD,
          COMPANY_NOTE_TARGETS_FIELD,
        ],
      }),
    ).toBeUndefined();
  });

  it('ignores malformed owner declarations for another target group', () => {
    const unrelatedMalformedOwnerField = {
      ...NOTE_TARGETS_FIELD,
      id: 'unrelated-malformed-note-targets-field',
      universalIdentifier: 'unrelated-malformed-note-targets-field-uid',
      relationTargetFieldMetadataId: 'missing-source-field',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
        junctionTargetFieldId: NON_MORPH_JUNCTION_TARGET_FIELD.id,
      },
    };

    expect(
      resolveVisibleShape({
        relationFlatFieldMetadata: COMPANY_NOTE_TARGETS_FIELD,
        fieldMetadata: [
          NOTE_TARGETS_FIELD,
          NOTE_TARGET_NOTE_FIELD,
          unrelatedMalformedOwnerField,
          NON_MORPH_JUNCTION_TARGET_FIELD,
          NOTE_TARGET_PERSON_FIELD,
          NOTE_TARGET_COMPANY_FIELD,
          PERSON_NOTE_TARGETS_FIELD,
          COMPANY_NOTE_TARGETS_FIELD,
        ],
      }),
    ).toEqual({
      kind: 'JUNCTION',
      junctionObjectMetadataId: NOTE_TARGET_OBJECT.id,
      junctionObjectNameSingular: NOTE_TARGET_OBJECT.nameSingular,
      junctionSourceJoinColumnName: 'targetCompanyId',
      isTargetMorphRelation: false,
      targetJoinColumns: [
        {
          joinColumnName: 'noteId',
          targetObjectMetadataId: NOTE_OBJECT.id,
          targetObjectNameSingular: NOTE_OBJECT.nameSingular,
        },
      ],
    });
  });
});
