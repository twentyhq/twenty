import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type CompiledStatement } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

type WorkspaceRepositoryOptions = ConstructorParameters<
  typeof WorkspaceRepository
>[0];

const OBJECT_METADATA_ID = 'delivery-object-id';

const buildField = (name: string, type: FieldMetadataType) =>
  getFlatFieldMetadataMock({
    id: `field-${name}`,
    universalIdentifier: `field-${name}`,
    objectMetadataId: OBJECT_METADATA_ID,
    name,
    type,
  });

const FIELDS = [
  buildField('id', FieldMetadataType.UUID),
  buildField('state', FieldMetadataType.TEXT),
  buildField('attachments', FieldMetadataType.FILES),
  buildField('updatedAt', FieldMetadataType.DATE_TIME),
  buildField('deletedAt', FieldMetadataType.DATE_TIME),
];

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: Object.fromEntries(
    FIELDS.map((field) => [field.universalIdentifier, field]),
  ),
  universalIdentifierById: Object.fromEntries(
    FIELDS.map((field) => [field.id, field.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
};

const flatObjectMetadata = getFlatObjectMetadataMock({
  id: OBJECT_METADATA_ID,
  universalIdentifier: OBJECT_METADATA_ID,
  nameSingular: 'delivery',
  namePlural: 'deliveries',
  isSystem: true,
  fieldIds: FIELDS.map((field) => field.id),
});

const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
  byUniversalIdentifier: { [OBJECT_METADATA_ID]: flatObjectMetadata },
  universalIdentifierById: { [OBJECT_METADATA_ID]: OBJECT_METADATA_ID },
  universalIdentifiersByApplicationId: {},
};

const tableShape: WorkspaceTableShape = {
  objectMetadataId: OBJECT_METADATA_ID,
  nameSingular: 'delivery',
  schemaName: 'workspace_1wgvd1injqtife6y4rvfbu3h5',
  tableName: 'delivery',
  columnShapeByColumnName: Object.fromEntries(
    FIELDS.map((field) => [
      field.name,
      {
        columnName: field.name,
        fieldMetadataId: field.id,
        fieldName: field.name,
        fieldMetadataType: field.type,
      },
    ]),
  ),
  columnNames: FIELDS.map((field) => field.name),
  relationShapeByFieldName: {},
  hasDeletedAtColumn: true,
};

const buildRepository = ({
  shouldSkipEventEmission,
}: {
  shouldSkipEventEmission: boolean;
}) => {
  const executedStatements: CompiledStatement[] = [];

  const repository = new WorkspaceRepository({
    tableShape,
    flatObjectMetadata,
    internalContext: {
      workspaceId: 'workspace-id',
      featureFlagsMap: {},
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular: { delivery: OBJECT_METADATA_ID },
      eventEmitterService: { emitDatabaseBatchEvent: jest.fn() },
      coreDataSource: { getRepository: () => ({}) },
    },
    executor: {
      execute: async (statement: CompiledStatement) => {
        executedStatements.push(statement);

        return [];
      },
    },
    objectRecordsPermissions: {},
    shouldBypassPermissionChecks: true,
    shouldSkipEventEmission,
    tableShapeByObjectMetadataId: () => tableShape,
  } as unknown as WorkspaceRepositoryOptions);

  const getExecutedStatementKinds = () =>
    executedStatements.map((statement) => statement.text.split(' ')[0]);

  return { repository, getExecutedStatementKinds };
};

describe('WorkspaceRepository mutations', () => {
  describe('on a repository that bypasses permission checks and skips events', () => {
    it('should update without reading a before-image', async () => {
      const { repository, getExecutedStatementKinds } = buildRepository({
        shouldSkipEventEmission: true,
      });

      await repository.update({ id: 'delivery-id' }, { state: 'SENT' });

      expect(getExecutedStatementKinds()).toEqual(['UPDATE']);
    });

    it.each([
      ['delete', 'DELETE'],
      ['softDelete', 'UPDATE'],
      ['restore', 'UPDATE'],
    ] as const)(
      'should %s without reading a before-image',
      async (method, statementKind) => {
        const { repository, getExecutedStatementKinds } = buildRepository({
          shouldSkipEventEmission: true,
        });

        await repository[method]({ id: 'delivery-id' });

        expect(getExecutedStatementKinds()).toEqual([statementKind]);
      },
    );

    it('should still read the before-image when an update touches a files field', async () => {
      const { repository, getExecutedStatementKinds } = buildRepository({
        shouldSkipEventEmission: true,
      });

      await expect(
        repository.update({ id: 'delivery-id' }, { attachments: [] }),
      ).rejects.toThrow('Cannot update multiple records with files field');

      expect(getExecutedStatementKinds()).toEqual(['SELECT']);
    });
  });

  describe('on a repository that emits events', () => {
    it('should read the before- and after-image around an update', async () => {
      const { repository, getExecutedStatementKinds } = buildRepository({
        shouldSkipEventEmission: false,
      });

      await repository.update({ id: 'delivery-id' }, { state: 'SENT' });

      expect(getExecutedStatementKinds()).toEqual([
        'SELECT',
        'UPDATE',
        'SELECT',
      ]);
    });

    it('should read the before-image before a delete', async () => {
      const { repository, getExecutedStatementKinds } = buildRepository({
        shouldSkipEventEmission: false,
      });

      await repository.delete({ id: 'delivery-id' });

      expect(getExecutedStatementKinds()).toEqual(['SELECT', 'DELETE']);
    });
  });
});
