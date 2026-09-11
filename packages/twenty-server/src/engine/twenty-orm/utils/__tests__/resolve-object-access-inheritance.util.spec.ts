import {
  FieldMetadataType,
  MetadataReadability,
  ObjectAccessInheritanceMatch,
  ObjectAccessInheritanceRelationKind,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveObjectAccessInheritance } from 'src/engine/twenty-orm/utils/resolve-object-access-inheritance.util';

const ATTACHMENT_OBJECT_ID = 'attachment-object-id';
const NOTE_OBJECT_ID = 'note-object-id';
const PERSON_OBJECT_ID = 'person-object-id';
const PET_OBJECT_ID = 'pet-object-id';
const TARGET_MORPH_ID = 'target-morph-id';
const OTHER_MORPH_ID = 'other-morph-id';

const buildRelationField = ({
  id,
  name,
  type,
  objectMetadataId,
  relationTargetObjectMetadataId,
  morphId,
  relationType = RelationType.MANY_TO_ONE,
}: {
  id: string;
  name: string;
  type: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
  objectMetadataId: string;
  relationTargetObjectMetadataId: string;
  morphId?: string;
  relationType?: RelationType;
}) =>
  getFlatFieldMetadataMock({
    id,
    name,
    type,
    universalIdentifier: `${id}-universal-identifier`,
    objectMetadataId,
    relationTargetObjectMetadataId,
    morphId: morphId ?? null,
    settings: { relationType, joinColumnName: `${name}Id` },
  } as Parameters<typeof getFlatFieldMetadataMock>[0]);

const targetNoteField = buildRelationField({
  id: 'target-note-field-id',
  name: 'targetNote',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: NOTE_OBJECT_ID,
  morphId: TARGET_MORPH_ID,
});

const targetPersonField = buildRelationField({
  id: 'target-person-field-id',
  name: 'targetPerson',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: PERSON_OBJECT_ID,
  morphId: TARGET_MORPH_ID,
});

const targetPetField = buildRelationField({
  id: 'target-pet-field-id',
  name: 'targetPet',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: PET_OBJECT_ID,
  morphId: TARGET_MORPH_ID,
});

const otherMorphField = buildRelationField({
  id: 'other-morph-field-id',
  name: 'otherPerson',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: PERSON_OBJECT_ID,
  morphId: OTHER_MORPH_ID,
});

const noteField = buildRelationField({
  id: 'note-field-id',
  name: 'note',
  type: FieldMetadataType.RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: NOTE_OBJECT_ID,
});

const attachmentsField = buildRelationField({
  id: 'note-attachments-field-id',
  name: 'attachments',
  type: FieldMetadataType.RELATION,
  objectMetadataId: NOTE_OBJECT_ID,
  relationTargetObjectMetadataId: ATTACHMENT_OBJECT_ID,
  relationType: RelationType.ONE_TO_MANY,
});

const danglingField = buildRelationField({
  id: 'dangling-field-id',
  name: 'dangling',
  type: FieldMetadataType.RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: 'unknown-object-id',
});

const allFields = [
  targetNoteField,
  targetPersonField,
  targetPetField,
  otherMorphField,
  noteField,
  attachmentsField,
  danglingField,
];

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

const flatFieldMetadataMaps = buildFlatEntityMaps(allFields);

const flatObjectMetadataMaps = buildFlatEntityMaps([
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
    id: PET_OBJECT_ID,
    universalIdentifier: 'pet-object-universal-identifier',
    nameSingular: 'pet',
  }),
]);

const buildAttachment = (
  inheritance: FlatObjectMetadata['inheritance'],
): FlatObjectMetadata =>
  getFlatObjectMetadataMock({
    id: ATTACHMENT_OBJECT_ID,
    universalIdentifier: 'attachment-object-universal-identifier',
    nameSingular: 'attachment',
    readability: MetadataReadability.INHERITED,
    fieldIds: allFields
      .filter((field) => field.objectMetadataId === ATTACHMENT_OBJECT_ID)
      .map((field) => field.id),
    inheritance,
  });

const resolve = (inheritance: FlatObjectMetadata['inheritance']) =>
  resolveObjectAccessInheritance({
    flatObjectMetadata: buildAttachment(inheritance),
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
  });

describe('resolveObjectAccessInheritance', () => {
  it('expands a morph reference into every variant of that morph group', () => {
    const resolution = resolve({
      match: ObjectAccessInheritanceMatch.ANY,
      through: [
        {
          kind: ObjectAccessInheritanceRelationKind.MORPH,
          morphId: TARGET_MORPH_ID,
        },
      ],
    });

    expect(resolution).toMatchObject({ status: 'resolved' });

    if (resolution.status !== 'resolved') {
      return;
    }

    expect(resolution.branches).toHaveLength(1);
    expect(resolution.branches[0].isMorph).toBe(true);
    expect(
      resolution.branches[0].columns.map((column) => column.joinColumnName),
    ).toEqual(['targetNoteId', 'targetPersonId', 'targetPetId']);
  });

  it('keeps every branch separate and carries the declared match', () => {
    const resolution = resolve({
      match: ObjectAccessInheritanceMatch.ALL,
      through: [
        {
          kind: ObjectAccessInheritanceRelationKind.MORPH,
          morphId: TARGET_MORPH_ID,
        },
        {
          kind: ObjectAccessInheritanceRelationKind.FIELD,
          fieldUniversalIdentifier: noteField.universalIdentifier,
        },
      ],
    });

    expect(resolution).toMatchObject({
      status: 'resolved',
      match: ObjectAccessInheritanceMatch.ALL,
    });

    if (resolution.status !== 'resolved') {
      return;
    }

    expect(resolution.branches).toHaveLength(2);
    expect(resolution.branches[1]).toMatchObject({
      isMorph: false,
      columns: [
        {
          joinColumnName: 'noteId',
          parentObjectMetadataId: NOTE_OBJECT_ID,
        },
      ],
    });
  });

  it.each([
    ['a missing inheritance declaration', null, 'MISSING_INHERITANCE'],
    [
      'an empty selection',
      { match: ObjectAccessInheritanceMatch.ANY, through: [] },
      'EMPTY_INHERITANCE',
    ],
    [
      'an unknown reference',
      {
        match: ObjectAccessInheritanceMatch.ANY,
        through: [
          {
            kind: ObjectAccessInheritanceRelationKind.FIELD,
            fieldUniversalIdentifier: 'does-not-exist',
          },
        ],
      },
      'UNKNOWN_RELATION_REFERENCE',
    ],
    [
      'a relation of another object',
      {
        match: ObjectAccessInheritanceMatch.ANY,
        through: [
          {
            kind: ObjectAccessInheritanceRelationKind.FIELD,
            fieldUniversalIdentifier: attachmentsField.universalIdentifier,
          },
        ],
      },
      'RELATION_NOT_OWNED_BY_OBJECT',
    ],
    [
      'a morph variant referenced as a plain field',
      {
        match: ObjectAccessInheritanceMatch.ANY,
        through: [
          {
            kind: ObjectAccessInheritanceRelationKind.FIELD,
            fieldUniversalIdentifier: targetNoteField.universalIdentifier,
          },
        ],
      },
      'MORPH_FIELD_REFERENCED_AS_PLAIN_RELATION',
    ],
    [
      'a relation whose target object is gone',
      {
        match: ObjectAccessInheritanceMatch.ANY,
        through: [
          {
            kind: ObjectAccessInheritanceRelationKind.FIELD,
            fieldUniversalIdentifier: danglingField.universalIdentifier,
          },
        ],
      },
      'UNKNOWN_PARENT_OBJECT',
    ],
  ])('refuses %s', (_label, inheritance, expectedCode) => {
    expect(
      resolve(inheritance as FlatObjectMetadata['inheritance']),
    ).toMatchObject({
      status: 'invalid',
      code: expectedCode,
    });
  });

  it('refuses an unsupported relation direction instead of ignoring it', () => {
    const resolution = resolveObjectAccessInheritance({
      flatObjectMetadata: getFlatObjectMetadataMock({
        id: NOTE_OBJECT_ID,
        universalIdentifier: 'note-object-universal-identifier',
        nameSingular: 'note',
        readability: MetadataReadability.INHERITED,
        fieldIds: [attachmentsField.id],
        inheritance: {
          match: ObjectAccessInheritanceMatch.ANY,
          through: [
            {
              kind: ObjectAccessInheritanceRelationKind.FIELD,
              fieldUniversalIdentifier: attachmentsField.universalIdentifier,
            },
          ],
        },
      }),
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
    });

    expect(resolution).toMatchObject({
      status: 'invalid',
      code: 'UNSUPPORTED_RELATION_DIRECTION',
    });
  });
});
