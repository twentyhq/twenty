import {
  FieldMetadataType,
  MetadataReadability,
  ObjectAccessInheritanceMatch,
  ObjectAccessInheritanceRelationKind,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { InheritedRecordAccessService } from 'src/engine/record-share/services/inherited-record-access.service';
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const WORKSPACE_ID = 'workspace-id';
const PRINCIPAL_ID = 'principal-id';
const CHILD_OBJECT_ID = 'child-object-id';
const SOURCE_OBJECT_ID = 'source-object-id';
const TARGET_OBJECT_ID = 'target-object-id';
const TARGET_MORPH_ID = 'target-morph-id';

const buildRelationField = ({
  id,
  name,
  objectMetadataId,
  relationTargetObjectMetadataId,
  type = FieldMetadataType.RELATION,
  morphId = null,
}: {
  id: string;
  name: string;
  objectMetadataId: string;
  relationTargetObjectMetadataId: string;
  type?: FieldMetadataType;
  morphId?: string | null;
}) =>
  getFlatFieldMetadataMock({
    id,
    name,
    type,
    universalIdentifier: `${id}-universal-identifier`,
    objectMetadataId,
    relationTargetObjectMetadataId,
    morphId,
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: `${name}Id`,
    },
  } as Parameters<typeof getFlatFieldMetadataMock>[0]);

const sourceField = buildRelationField({
  id: 'source-field-id',
  name: 'source',
  objectMetadataId: CHILD_OBJECT_ID,
  relationTargetObjectMetadataId: SOURCE_OBJECT_ID,
});

const targetField = buildRelationField({
  id: 'target-field-id',
  name: 'target',
  objectMetadataId: CHILD_OBJECT_ID,
  relationTargetObjectMetadataId: TARGET_OBJECT_ID,
});

const morphSourceField = buildRelationField({
  id: 'morph-source-field-id',
  name: 'linkedSource',
  objectMetadataId: CHILD_OBJECT_ID,
  relationTargetObjectMetadataId: SOURCE_OBJECT_ID,
  type: FieldMetadataType.MORPH_RELATION,
  morphId: TARGET_MORPH_ID,
});

const morphTargetField = buildRelationField({
  id: 'morph-target-field-id',
  name: 'linkedTarget',
  objectMetadataId: CHILD_OBJECT_ID,
  relationTargetObjectMetadataId: TARGET_OBJECT_ID,
  type: FieldMetadataType.MORPH_RELATION,
  morphId: TARGET_MORPH_ID,
});

const allFields = [
  sourceField,
  targetField,
  morphSourceField,
  morphTargetField,
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

const sourceObject = getFlatObjectMetadataMock({
  id: SOURCE_OBJECT_ID,
  universalIdentifier: 'source-object-universal-identifier',
  nameSingular: 'source',
  readability: MetadataReadability.PRIVATE,
});

const targetObject = getFlatObjectMetadataMock({
  id: TARGET_OBJECT_ID,
  universalIdentifier: 'target-object-universal-identifier',
  nameSingular: 'target',
  readability: MetadataReadability.PRIVATE,
});

const flatFieldMetadataMaps = buildFlatEntityMaps(allFields);
const flatObjectMetadataMaps = buildFlatEntityMaps([
  sourceObject,
  targetObject,
]);

const buildChildObject = (
  inheritance: FlatObjectMetadata['inheritance'],
): FlatObjectMetadata =>
  getFlatObjectMetadataMock({
    id: CHILD_OBJECT_ID,
    universalIdentifier: 'child-object-universal-identifier',
    nameSingular: 'child',
    readability: MetadataReadability.INHERITED,
    fieldIds: allFields.map((field) => field.id),
    inheritance,
  });

const buildRecordShare = (objectMetadataId: string, recordId: string) => ({
  id: `${objectMetadataId}-${recordId}`,
  recordId,
  objectMetadataId,
  principalId: PRINCIPAL_ID,
  principalType: RecordSharePrincipalType.ROLE,
  accessLevel: RecordShareAccessLevel.READ,
  rowCause: RecordShareRowCause.MANUAL,
  sourceId: 'source-id',
  deletedAt: null,
});

describe('InheritedRecordAccessService', () => {
  const sharedSourceId = 'shared-source-record-id';
  const sharedTargetId = 'shared-target-record-id';

  const recordShareService = {
    findByRecordIds: jest.fn(
      async ({
        objectMetadataId,
        recordIds,
      }: {
        objectMetadataId: string;
        recordIds: string[];
      }) =>
        recordIds
          .filter(
            (recordId) =>
              recordId === sharedSourceId || recordId === sharedTargetId,
          )
          .map((recordId) => buildRecordShare(objectMetadataId, recordId)),
    ),
  } as unknown as RecordShareService;

  const workspaceOrmManager = {} as unknown as WorkspaceOrmManager;

  const service = new InheritedRecordAccessService(
    recordShareService,
    workspaceOrmManager,
  );

  const resolve = ({
    inheritance,
    records,
  }: {
    inheritance: FlatObjectMetadata['inheritance'];
    records: Record<string, unknown>[];
  }) =>
    service.resolveAuthorizedRecordIds({
      flatObjectMetadata: buildChildObject(inheritance),
      records,
      context: {
        workspaceId: WORKSPACE_ID,
        principalIds: [PRINCIPAL_ID],
        accessLevels: [RecordShareAccessLevel.READ],
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      },
    });

  const ANY_BOTH = {
    match: ObjectAccessInheritanceMatch.ANY,
    through: [
      {
        kind: ObjectAccessInheritanceRelationKind.FIELD,
        fieldUniversalIdentifier: sourceField.universalIdentifier,
      },
      {
        kind: ObjectAccessInheritanceRelationKind.FIELD,
        fieldUniversalIdentifier: targetField.universalIdentifier,
      },
    ],
  } as FlatObjectMetadata['inheritance'];

  const records = [
    { id: 'both', sourceId: sharedSourceId, targetId: sharedTargetId },
    { id: 'only-source', sourceId: sharedSourceId, targetId: 'other-target' },
    { id: 'only-target', sourceId: 'other-source', targetId: sharedTargetId },
    { id: 'orphan' },
  ];

  it('grants a record whose any branch is authorized', async () => {
    expect(
      [...(await resolve({ inheritance: ANY_BOTH, records }))].sort(),
    ).toEqual(['both', 'only-source', 'only-target']);
  });

  it('requires every branch under ALL', async () => {
    expect([
      ...(await resolve({
        inheritance: {
          ...(ANY_BOTH as { through: unknown[] }),
          match: ObjectAccessInheritanceMatch.ALL,
        } as FlatObjectMetadata['inheritance'],
        records,
      })),
    ]).toEqual(['both']);
  });

  it('denies a record with no populated parent', async () => {
    expect(
      await resolve({ inheritance: ANY_BOTH, records: [{ id: 'orphan' }] }),
    ).toEqual(new Set());
  });

  it('denies a malformed morph carrying two concrete parents', async () => {
    const morphInheritance = {
      match: ObjectAccessInheritanceMatch.ANY,
      through: [
        {
          kind: ObjectAccessInheritanceRelationKind.MORPH,
          morphId: TARGET_MORPH_ID,
        },
      ],
    } as FlatObjectMetadata['inheritance'];

    expect([
      ...(await resolve({
        inheritance: morphInheritance,
        records: [
          { id: 'single', linkedSourceId: sharedSourceId },
          {
            id: 'malformed',
            linkedSourceId: sharedSourceId,
            linkedTargetId: 'other-target',
          },
        ],
      })),
    ]).toEqual(['single']);
  });

  it('denies everything when the policy cannot be resolved', async () => {
    expect(await resolve({ inheritance: null, records })).toEqual(new Set());
  });
});
