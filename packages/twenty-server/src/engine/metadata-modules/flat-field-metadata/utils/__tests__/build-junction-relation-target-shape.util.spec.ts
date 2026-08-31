import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildJunctionRelationTargetShape } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-junction-relation-target-shape.util';
import { resolveJunctionRelationTargetShapeFromVisibleField } from 'src/engine/metadata-modules/flat-field-metadata/utils/resolve-junction-relation-target-shape-from-visible-field.util';

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

const PERSON_NOTE_TARGETS_FIELD = {
  id: 'person-note-targets-field',
  universalIdentifier: 'person-note-targets-field-uid',
  name: 'noteTargets',
  type: FieldMetadataType.RELATION,
  objectMetadataId: PERSON_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: NOTE_TARGET_OBJECT.id,
  relationTargetFieldMetadataId: 'note-target-person-field',
  settings: {
    relationType: RelationType.ONE_TO_MANY,
  },
};

const COMPANY_NOTE_TARGETS_FIELD = {
  id: 'company-note-targets-field',
  universalIdentifier: 'company-note-targets-field-uid',
  name: 'noteTargets',
  type: FieldMetadataType.RELATION,
  objectMetadataId: COMPANY_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: NOTE_TARGET_OBJECT.id,
  relationTargetFieldMetadataId: 'note-target-company-field',
  settings: {
    relationType: RelationType.ONE_TO_MANY,
  },
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

const PERSON_JUNCTIONS_FIELD = {
  id: 'person-junctions-field',
  universalIdentifier: 'person-junctions-field-uid',
  name: 'junctions',
  type: FieldMetadataType.RELATION,
  objectMetadataId: PERSON_OBJECT.id,
  morphId: null,
  relationTargetObjectMetadataId: NOTE_TARGET_OBJECT.id,
  relationTargetFieldMetadataId: NON_MORPH_JUNCTION_TARGET_FIELD.id,
  settings: {
    relationType: RelationType.ONE_TO_MANY,
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
  PERSON_NOTE_TARGETS_FIELD,
  COMPANY_NOTE_TARGETS_FIELD,
]) as unknown as FlatEntityMaps<FlatFieldMetadata>;

const buildShape = (relationFlatFieldMetadata: object) =>
  buildJunctionRelationTargetShape({
    relationFlatFieldMetadata:
      relationFlatFieldMetadata as unknown as FlatFieldMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

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

describe('resolveJunctionRelationTargetShapeFromVisibleField', () => {
  it('keeps an owning junction field orientation unchanged', () => {
    expect(
      resolveVisibleShape({ relationFlatFieldMetadata: NOTE_TARGETS_FIELD }),
    ).toEqual(buildShape(NOTE_TARGETS_FIELD));
  });

  it('fails closed when an owning junction target edge is not reciprocal', () => {
    expect(
      resolveVisibleShape({
        relationFlatFieldMetadata: NOTE_TARGETS_FIELD,
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
  });

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
          COMPANY_NOTE_TARGETS_FIELD,
        ],
      }),
    ).toEqual({
      kind: 'JUNCTION',
      junctionObjectMetadataId: NOTE_TARGET_OBJECT.id,
      junctionObjectNameSingular: NOTE_TARGET_OBJECT.nameSingular,
      junctionSourceJoinColumnName: 'targetCompanyId',
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
