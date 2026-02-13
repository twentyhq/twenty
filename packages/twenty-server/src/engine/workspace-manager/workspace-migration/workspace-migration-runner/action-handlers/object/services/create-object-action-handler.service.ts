import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { ALL_METADATA_ENTITY_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-entity-by-metadata-name.constant';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import {
  FlatCreateObjectAction,
  UniversalCreateObjectAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';
import { fromUniversalFlatFieldMetadataToFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/from-universal-flat-field-metadata-to-flat-field-metadata.util';
import { fromUniversalFlatObjectMetadataToFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/object/services/utils/from-universal-flat-object-metadata-to-flat-object-metadata.util';
import {
  WorkspaceMigrationActionRunnerContext,
  type WorkspaceMigrationActionRunnerArgs,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { flatEntityToScalarFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/flat-entity-to-scalar-flat-entity.util';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumOperationsForObject,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/workspace-schema-enum-operations.util';

@Injectable()
export class CreateObjectActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'objectMetadata',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalCreateObjectAction>,
  ): Promise<FlatCreateObjectAction> {
    const { action, queryRunner, workspaceId, allFlatEntityMaps } = context;
    const { fieldIdByUniversalIdentifier, id: providedObjectId } = action;

    const dataSourceRepository =
      queryRunner.manager.getRepository<DataSourceEntity>(DataSourceEntity);

    const lastDataSourceMetadata = await dataSourceRepository.findOneOrFail({
      where: {
        workspaceId,
      },
      order: { createdAt: 'DESC' },
    });

    const allFieldIdToBeCreatedInActionByUniversalIdentifierMap = new Map<
      string,
      string
    >();

    for (const universalFlatFieldMetadata of action.universalFlatFieldMetadatas) {
      const providedFieldId =
        fieldIdByUniversalIdentifier?.[
          universalFlatFieldMetadata.universalIdentifier
        ];

      allFieldIdToBeCreatedInActionByUniversalIdentifierMap.set(
        universalFlatFieldMetadata.universalIdentifier,
        providedFieldId ?? v4(),
      );
    }

    const flatObjectMetadata =
      fromUniversalFlatObjectMetadataToFlatObjectMetadata({
        allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
        allFlatEntityMaps,
        context,
        dataSourceId: lastDataSourceMetadata.id,
        generatedId: providedObjectId ?? v4(),
        universalFlatObjectMetadata: action.flatEntity,
      });

    const flatFieldMetadatas = action.universalFlatFieldMetadatas.map(
      (universalFlatFieldMetadata) =>
        fromUniversalFlatFieldMetadataToFlatFieldMetadata({
          objectMetadataId: flatObjectMetadata.id,
          universalFlatFieldMetadata,
          allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
          allFlatEntityMaps,
          context,
        }),
    );

    return {
      type: action.type,
      metadataName: action.metadataName,
      flatEntity: flatObjectMetadata,
      flatFieldMetadatas,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateObjectAction>,
  ): Promise<void> {
    const { queryRunner, flatAction } = context;
    const { flatEntity: flatObjectMetadata, flatFieldMetadatas } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatObjectMetadata],
    });

    const scalarFieldMetadatas = flatFieldMetadatas.map((flatFieldMetadata) =>
      flatEntityToScalarFlatEntity({
        metadataName: 'fieldMetadata',
        flatEntity: flatFieldMetadata,
      }),
    );

    const fieldMetadataRepository = queryRunner.manager.getRepository(
      ALL_METADATA_ENTITY_BY_METADATA_NAME['fieldMetadata'],
    );

    await fieldMetadataRepository.insert(scalarFieldMetadatas);
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateObjectAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity: flatObjectMetadata, flatFieldMetadatas } = flatAction;

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: flatObjectMetadata,
    });

    const columnDefinitions = flatFieldMetadatas.flatMap((flatFieldMetadata) =>
      generateColumnDefinitions({
        flatFieldMetadata,
        flatObjectMetadata,
        workspaceId,
      }),
    );

    const enumOrCompositeFlatFieldMetadatas = flatFieldMetadatas.filter(
      (flatFieldMetadata) =>
        isEnumFlatFieldMetadata(flatFieldMetadata) ||
        isCompositeFlatFieldMetadata(flatFieldMetadata),
    );

    const enumOperations = collectEnumOperationsForObject({
      flatFieldMetadatas: enumOrCompositeFlatFieldMetadatas,
      tableName,
      operation: EnumOperation.CREATE,
    });

    await executeBatchEnumOperations({
      enumOperations,
      queryRunner,
      schemaName,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
    });

    await this.workspaceSchemaManagerService.tableManager.createTable({
      queryRunner,
      schemaName,
      tableName,
      columnDefinitions,
    });
  }
}
