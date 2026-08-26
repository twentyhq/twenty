import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

describe('WorkspaceRepository', () => {
  it('should emit create events from the inserted rows when the event snapshot read is empty', async () => {
    const objectMetadataId = 'company-object-id';
    const workspaceId = 'workspace-id';
    const recordId = 'record-id';
    const fieldIds = ['id-field-id', 'name-field-id'];

    const flatObjectMetadata = {
      id: objectMetadataId,
      workspaceId,
      nameSingular: 'company',
      namePlural: 'companies',
      fieldIds,
      universalIdentifier: objectMetadataId,
    } as FlatObjectMetadata;

    const idFieldMetadata = {
      id: fieldIds[0],
      objectMetadataId,
      name: 'id',
      type: FieldMetadataType.UUID,
      universalIdentifier: fieldIds[0],
    } as FlatFieldMetadata;
    const nameFieldMetadata = {
      id: fieldIds[1],
      objectMetadataId,
      name: 'name',
      type: FieldMetadataType.TEXT,
      universalIdentifier: fieldIds[1],
    } as FlatFieldMetadata;
    const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
      byUniversalIdentifier: {
        [fieldIds[0]]: idFieldMetadata,
        [fieldIds[1]]: nameFieldMetadata,
      },
      universalIdentifierById: {
        [fieldIds[0]]: fieldIds[0],
        [fieldIds[1]]: fieldIds[1],
      },
      universalIdentifiersByApplicationId: {},
    };
    const flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata> = {
      byUniversalIdentifier: {
        [objectMetadataId]: flatObjectMetadata,
      },
      universalIdentifierById: {
        [objectMetadataId]: objectMetadataId,
      },
      universalIdentifiersByApplicationId: {},
    };
    const tableShape: WorkspaceTableShape = {
      objectMetadataId,
      nameSingular: 'company',
      schemaName: 'workspace_test',
      tableName: 'company',
      columnShapeByColumnName: {
        id: {
          columnName: 'id',
          fieldMetadataId: fieldIds[0],
          fieldName: 'id',
          fieldMetadataType: FieldMetadataType.UUID,
        },
        name: {
          columnName: 'name',
          fieldMetadataId: fieldIds[1],
          fieldName: 'name',
          fieldMetadataType: FieldMetadataType.TEXT,
        },
      },
      columnNames: ['id', 'name'],
      relationShapeByFieldName: {},
      hasDeletedAtColumn: false,
    };
    const emitDatabaseBatchEvent = jest.fn();
    const executor: QueryExecutor = {
      execute: jest.fn(async (statement) =>
        statement.text.startsWith('INSERT')
          ? [{ id: recordId, name: 'Acme' }]
          : [],
      ),
    };
    let repository: WorkspaceRepository;

    repository = new WorkspaceRepository({
      tableShape,
      flatObjectMetadata,
      internalContext: {
        workspaceId,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular: { company: objectMetadataId },
        eventEmitterService: { emitDatabaseBatchEvent },
        coreDataSource: { getRepository: jest.fn() },
      } as unknown as WorkspaceInternalContext,
      authContext: {} as WorkspaceAuthContext,
      executor,
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks: true,
      tableShapeByObjectMetadataId: () => tableShape,
      flatObjectMetadataByObjectMetadataId: () => flatObjectMetadata,
      getRepositoryForObjectMetadataId: () => repository,
      isTransactional: false,
      runInNewTransaction: async () => {
        throw new Error('Not used in this test');
      },
    });

    const insertResult = await repository.runInsert({
      records: [{ id: recordId, name: 'Acme' }],
      columnsToReturn: ['id'],
    });

    expect(executor.execute).toHaveBeenCalledTimes(1);
    expect(insertResult.raw).toEqual([{ id: recordId }]);
    expect(emitDatabaseBatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'created',
        events: [
          expect.objectContaining({
            recordId,
            properties: { after: { id: recordId, name: 'Acme' } },
          }),
        ],
      }),
    );
  });
});
