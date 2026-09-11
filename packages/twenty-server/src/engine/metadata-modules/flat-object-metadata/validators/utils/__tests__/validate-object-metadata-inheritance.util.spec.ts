import {
  FieldMetadataType,
  MetadataReadability,
  type ObjectAccessInheritance,
  ObjectAccessInheritanceMatch,
  ObjectAccessInheritanceRelationKind,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { validateObjectMetadataInheritance } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-object-metadata-inheritance.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

const CHILD_UID = 'child-object-uid';
const PARENT_UID = 'parent-object-uid';
const CHILD_PARENT_FIELD_UID = 'child-parent-field-uid';
const PARENT_CHILD_FIELD_UID = 'parent-child-field-uid';

const buildField = ({
  universalIdentifier,
  name,
  objectMetadataUniversalIdentifier,
  relationTargetObjectMetadataUniversalIdentifier,
  type = FieldMetadataType.RELATION,
  relationType = RelationType.MANY_TO_ONE,
  morphId = null,
}: {
  universalIdentifier: string;
  name: string;
  objectMetadataUniversalIdentifier: string;
  relationTargetObjectMetadataUniversalIdentifier: string;
  type?: FieldMetadataType;
  relationType?: RelationType;
  morphId?: string | null;
}) =>
  ({
    universalIdentifier,
    name,
    type,
    morphId,
    objectMetadataUniversalIdentifier,
    relationTargetObjectMetadataUniversalIdentifier,
    universalSettings: { relationType },
  }) as unknown as UniversalFlatFieldMetadata;

const buildObject = ({
  universalIdentifier,
  nameSingular,
  fieldUniversalIdentifiers,
  readability = MetadataReadability.OPEN,
  inheritance = null,
}: {
  universalIdentifier: string;
  nameSingular: string;
  fieldUniversalIdentifiers: string[];
  readability?: MetadataReadability;
  inheritance?: ObjectAccessInheritance | null;
}) =>
  ({
    universalIdentifier,
    nameSingular,
    fieldUniversalIdentifiers,
    readability,
    inheritance,
  }) as unknown as UniversalFlatObjectMetadata;

const buildMaps = <T extends { universalIdentifier: string }>(
  entities: T[],
): UniversalFlatEntityMaps<never> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      entities.map((entity) => [entity.universalIdentifier, entity]),
    ),
  }) as unknown as UniversalFlatEntityMaps<never>;

const childParentField = buildField({
  universalIdentifier: CHILD_PARENT_FIELD_UID,
  name: 'parent',
  objectMetadataUniversalIdentifier: CHILD_UID,
  relationTargetObjectMetadataUniversalIdentifier: PARENT_UID,
});

const parentChildField = buildField({
  universalIdentifier: PARENT_CHILD_FIELD_UID,
  name: 'child',
  objectMetadataUniversalIdentifier: PARENT_UID,
  relationTargetObjectMetadataUniversalIdentifier: CHILD_UID,
});

const ANY_PARENT: ObjectAccessInheritance = {
  match: ObjectAccessInheritanceMatch.ANY,
  through: [
    {
      kind: ObjectAccessInheritanceRelationKind.FIELD,
      fieldUniversalIdentifier: CHILD_PARENT_FIELD_UID,
    },
  ],
};

const validate = ({
  child,
  parent,
  fields = [childParentField, parentChildField],
}: {
  child: UniversalFlatObjectMetadata;
  parent: UniversalFlatObjectMetadata;
  fields?: UniversalFlatFieldMetadata[];
}) =>
  validateObjectMetadataInheritance({
    universalFlatObjectMetadata: child,
    maps: {
      universalFlatObjectMetadataMaps: buildMaps([child, parent]),
      universalFlatFieldMetadataMaps: buildMaps(fields),
    },
  });

describe('validateObjectMetadataInheritance', () => {
  const openParent = buildObject({
    universalIdentifier: PARENT_UID,
    nameSingular: 'parent',
    fieldUniversalIdentifiers: [PARENT_CHILD_FIELD_UID],
  });

  it('accepts an INHERITED object pointing at an outgoing to-one relation', () => {
    expect(
      validate({
        child: buildObject({
          universalIdentifier: CHILD_UID,
          nameSingular: 'child',
          fieldUniversalIdentifiers: [CHILD_PARENT_FIELD_UID],
          readability: MetadataReadability.INHERITED,
          inheritance: ANY_PARENT,
        }),
        parent: openParent,
      }),
    ).toEqual([]);
  });

  it('refuses an INHERITED object without inheritance parameters', () => {
    expect(
      validate({
        child: buildObject({
          universalIdentifier: CHILD_UID,
          nameSingular: 'child',
          fieldUniversalIdentifiers: [CHILD_PARENT_FIELD_UID],
          readability: MetadataReadability.INHERITED,
        }),
        parent: openParent,
      }),
    ).toHaveLength(1);
  });

  it('refuses inheritance parameters on another readability', () => {
    expect(
      validate({
        child: buildObject({
          universalIdentifier: CHILD_UID,
          nameSingular: 'child',
          fieldUniversalIdentifiers: [CHILD_PARENT_FIELD_UID],
          readability: MetadataReadability.PRIVATE,
          inheritance: ANY_PARENT,
        }),
        parent: openParent,
      }),
    ).toHaveLength(1);
  });

  it('refuses an inbound relation as an access parent', () => {
    const errors = validate({
      child: buildObject({
        universalIdentifier: CHILD_UID,
        nameSingular: 'child',
        fieldUniversalIdentifiers: [CHILD_PARENT_FIELD_UID],
        readability: MetadataReadability.INHERITED,
        inheritance: {
          match: ObjectAccessInheritanceMatch.ANY,
          through: [
            {
              kind: ObjectAccessInheritanceRelationKind.FIELD,
              fieldUniversalIdentifier: PARENT_CHILD_FIELD_UID,
            },
          ],
        },
      }),
      parent: openParent,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('no relation of this object matches');
  });

  it('refuses the same relation selected twice', () => {
    const errors = validate({
      child: buildObject({
        universalIdentifier: CHILD_UID,
        nameSingular: 'child',
        fieldUniversalIdentifiers: [CHILD_PARENT_FIELD_UID],
        readability: MetadataReadability.INHERITED,
        inheritance: {
          match: ObjectAccessInheritanceMatch.ANY,
          through: [...ANY_PARENT.through, ...ANY_PARENT.through],
        },
      }),
      parent: openParent,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('twice');
  });

  it('refuses an inheritance cycle between two objects', () => {
    const child = buildObject({
      universalIdentifier: CHILD_UID,
      nameSingular: 'child',
      fieldUniversalIdentifiers: [CHILD_PARENT_FIELD_UID],
      readability: MetadataReadability.INHERITED,
      inheritance: ANY_PARENT,
    });

    const cyclicParent = buildObject({
      universalIdentifier: PARENT_UID,
      nameSingular: 'parent',
      fieldUniversalIdentifiers: [PARENT_CHILD_FIELD_UID],
      readability: MetadataReadability.INHERITED,
      inheritance: {
        match: ObjectAccessInheritanceMatch.ANY,
        through: [
          {
            kind: ObjectAccessInheritanceRelationKind.FIELD,
            fieldUniversalIdentifier: PARENT_CHILD_FIELD_UID,
          },
        ],
      },
    });

    const errors = validate({ child, parent: cyclicParent });

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('cyclic');
  });
});
