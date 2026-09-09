import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveLinkedRecordShareGateKind } from 'src/engine/record-share/utils/resolve-linked-record-share-gate-kind.util';

const OPEN_PARENT_OBJECT_ID = 'open-parent-object-id';
const PRIVATE_PARENT_OBJECT_ID = 'private-parent-object-id';

const buildParentField = ({
  id,
  objectMetadataId,
  relationTargetObjectMetadataId,
}: {
  id: string;
  objectMetadataId: string;
  relationTargetObjectMetadataId: string;
}) =>
  getFlatFieldMetadataMock({
    id,
    name: id,
    type: FieldMetadataType.RELATION,
    universalIdentifier: `${id}-universal-identifier`,
    objectMetadataId,
    relationTargetObjectMetadataId,
    morphId: null,
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: `${id}Id`,
    },
  } as Parameters<typeof getFlatFieldMetadataMock>[0]);

const buildFlatEntityMaps = <T extends FlatFieldMetadata | FlatObjectMetadata>(
  flatEntities: T[],
): FlatEntityMaps<T> => ({
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
});

const buildInheritedChild = ({
  id,
  parentObjectMetadataId,
}: {
  id: string;
  parentObjectMetadataId: string | undefined;
}) => {
  const parentField =
    parentObjectMetadataId === undefined
      ? undefined
      : buildParentField({
          id: `${id}-parent-field`,
          objectMetadataId: id,
          relationTargetObjectMetadataId: parentObjectMetadataId,
        });

  return {
    parentField,
    flatObjectMetadata: getFlatObjectMetadataMock({
      id,
      universalIdentifier: `${id}-universal-identifier`,
      nameSingular: id,
      readability: MetadataReadability.INHERITED,
      readabilityParentFieldUniversalIdentifiers:
        parentField === undefined ? [] : [parentField.universalIdentifier],
      fieldIds: parentField === undefined ? [] : [parentField.id],
    } as Parameters<typeof getFlatObjectMetadataMock>[0]),
  };
};

const openParent = getFlatObjectMetadataMock({
  id: OPEN_PARENT_OBJECT_ID,
  universalIdentifier: 'open-parent-universal-identifier',
  nameSingular: 'openParent',
  readability: MetadataReadability.OPEN,
} as Parameters<typeof getFlatObjectMetadataMock>[0]);

const privateParent = getFlatObjectMetadataMock({
  id: PRIVATE_PARENT_OBJECT_ID,
  universalIdentifier: 'private-parent-universal-identifier',
  nameSingular: 'privateParent',
  readability: MetadataReadability.PRIVATE,
} as Parameters<typeof getFlatObjectMetadataMock>[0]);

const childOfOpen = buildInheritedChild({
  id: 'child-of-open',
  parentObjectMetadataId: OPEN_PARENT_OBJECT_ID,
});
const childOfPrivate = buildInheritedChild({
  id: 'child-of-private',
  parentObjectMetadataId: PRIVATE_PARENT_OBJECT_ID,
});
const orphanChild = buildInheritedChild({
  id: 'orphan-child',
  parentObjectMetadataId: undefined,
});

const resolve = (flatObjectMetadata: FlatObjectMetadata) =>
  resolveLinkedRecordShareGateKind({
    flatObjectMetadata,
    isOwningApplication: false,
    flatFieldMetadataMaps: buildFlatEntityMaps(
      [
        childOfOpen.parentField,
        childOfPrivate.parentField,
        orphanChild.parentField,
      ].filter((field) => field !== undefined),
    ),
    flatObjectMetadataMaps: buildFlatEntityMaps([
      openParent,
      privateParent,
      childOfOpen.flatObjectMetadata,
      childOfPrivate.flatObjectMetadata,
      orphanChild.flatObjectMetadata,
    ]),
  });

describe('resolveLinkedRecordShareGateKind', () => {
  it.each([
    { when: 'the object is open', object: openParent, expected: 'open' },
    {
      when: 'the object is private',
      object: privateParent,
      expected: 'private',
    },
    {
      when: 'the object inherits from an open parent',
      object: childOfOpen.flatObjectMetadata,
      expected: 'open',
    },
    {
      when: 'the object inherits from a private parent',
      object: childOfPrivate.flatObjectMetadata,
      expected: 'deny',
    },
    {
      when: 'the object inherits from nothing',
      object: orphanChild.flatObjectMetadata,
      expected: 'deny',
    },
  ])('should return $expected when $when', ({ object, expected }) => {
    expect(resolve(object)).toBe(expected);
  });
});
