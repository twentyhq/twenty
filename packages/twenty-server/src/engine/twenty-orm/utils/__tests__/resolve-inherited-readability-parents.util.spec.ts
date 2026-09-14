import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveInheritedReadabilityParents } from 'src/engine/twenty-orm/utils/resolve-inherited-readability-parents.util';

const ATTACHMENT_OBJECT_ID = 'attachment-object-id';
const NOTE_OBJECT_ID = 'note-object-id';
const PERSON_OBJECT_ID = 'person-object-id';
const WORKSPACE_MEMBER_OBJECT_ID = 'workspace-member-object-id';
const TARGET_MORPH_ID = 'target-morph-id';
const OTHER_MORPH_ID = 'other-morph-id';

const buildManyToOneField = ({
  id,
  name,
  type,
  objectMetadataId,
  relationTargetObjectMetadataId,
  morphId,
}: {
  id: string;
  name: string;
  type: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
  objectMetadataId: string;
  relationTargetObjectMetadataId: string;
  morphId?: string;
}) =>
  getFlatFieldMetadataMock({
    id,
    name,
    type,
    universalIdentifier: `${id}-universal-identifier`,
    objectMetadataId,
    relationTargetObjectMetadataId,
    morphId: morphId ?? null,
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: `${name}Id`,
    },
  } as Parameters<typeof getFlatFieldMetadataMock>[0]);

const targetNoteField = buildManyToOneField({
  id: 'target-note-field-id',
  name: 'targetNote',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: NOTE_OBJECT_ID,
  morphId: TARGET_MORPH_ID,
});

const targetPersonField = buildManyToOneField({
  id: 'target-person-field-id',
  name: 'targetPerson',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: PERSON_OBJECT_ID,
  morphId: TARGET_MORPH_ID,
});

const otherMorphField = buildManyToOneField({
  id: 'other-morph-field-id',
  name: 'otherPerson',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: PERSON_OBJECT_ID,
  morphId: OTHER_MORPH_ID,
});

const authorField = buildManyToOneField({
  id: 'author-field-id',
  name: 'author',
  type: FieldMetadataType.RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
});

const noteAttachmentsField = getFlatFieldMetadataMock({
  id: 'note-attachments-field-id',
  name: 'attachments',
  type: FieldMetadataType.RELATION,
  universalIdentifier: 'note-attachments-field-id-universal-identifier',
  objectMetadataId: NOTE_OBJECT_ID,
  relationTargetObjectMetadataId: ATTACHMENT_OBJECT_ID,
  settings: { relationType: RelationType.ONE_TO_MANY },
} as Parameters<typeof getFlatFieldMetadataMock>[0]);

const nameField = getFlatFieldMetadataMock({
  id: 'name-field-id',
  name: 'name',
  type: FieldMetadataType.TEXT,
  universalIdentifier: 'name-field-id-universal-identifier',
  objectMetadataId: ATTACHMENT_OBJECT_ID,
});

const allFields = [
  targetNoteField,
  targetPersonField,
  otherMorphField,
  authorField,
  noteAttachmentsField,
  nameField,
];

const attachmentFields = allFields.filter(
  (field) => field.objectMetadataId === ATTACHMENT_OBJECT_ID,
);

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

const buildObjectMetadataMaps = () =>
  buildFlatEntityMaps([
    getFlatObjectMetadataMock({
      id: NOTE_OBJECT_ID,
      universalIdentifier: 'note-object-universal-identifier',
      nameSingular: 'note',
    }),
    getFlatObjectMetadataMock({
      id: PERSON_OBJECT_ID,
      universalIdentifier: 'person-object-universal-identifier',
      nameSingular: 'person',
    }),
    getFlatObjectMetadataMock({
      id: WORKSPACE_MEMBER_OBJECT_ID,
      universalIdentifier: 'workspace-member-object-universal-identifier',
      nameSingular: 'workspaceMember',
    }),
  ]);

const resolve = (readabilityParentFieldUniversalIdentifiers: string[]) =>
  resolveInheritedReadabilityParents({
    flatObjectMetadata: getFlatObjectMetadataMock({
      id: ATTACHMENT_OBJECT_ID,
      universalIdentifier: 'attachment-object-universal-identifier',
      nameSingular: 'attachment',
      fieldIds: attachmentFields.map((field) => field.id),
      readabilityParentFieldUniversalIdentifiers,
    }),
    flatFieldMetadataMaps: buildFlatEntityMaps(allFields),
    flatObjectMetadataMaps: buildObjectMetadataMaps(),
  }).map(({ joinColumnName, parentFlatObjectMetadata }) => ({
    joinColumnName,
    parentNameSingular: parentFlatObjectMetadata.nameSingular,
  }));

describe('resolveInheritedReadabilityParents', () => {
  it('should resolve a declared plain relation field to its join column and parent', () => {
    expect(resolve([authorField.universalIdentifier])).toEqual([
      { joinColumnName: 'authorId', parentNameSingular: 'workspaceMember' },
    ]);
  });

  it('should expand a declared morph relation field to every field sharing its morph id', () => {
    expect(resolve([targetNoteField.universalIdentifier])).toEqual([
      { joinColumnName: 'targetNoteId', parentNameSingular: 'note' },
      { joinColumnName: 'targetPersonId', parentNameSingular: 'person' },
    ]);
  });

  it('should ignore declared fields that are not to-one relations of the object', () => {
    expect(
      resolve([
        nameField.universalIdentifier,
        noteAttachmentsField.universalIdentifier,
        'unknown-universal-identifier',
      ]),
    ).toEqual([]);
  });

  it('should resolve nothing when no parent field is declared', () => {
    expect(
      resolveInheritedReadabilityParents({
        flatObjectMetadata: getFlatObjectMetadataMock({
          id: ATTACHMENT_OBJECT_ID,
          universalIdentifier: 'attachment-object-universal-identifier',
          fieldIds: attachmentFields.map((field) => field.id),
          readabilityParentFieldUniversalIdentifiers: null,
        }),
        flatFieldMetadataMaps: buildFlatEntityMaps(allFields),
        flatObjectMetadataMaps: buildObjectMetadataMaps(),
      }),
    ).toEqual([]);
  });
});
