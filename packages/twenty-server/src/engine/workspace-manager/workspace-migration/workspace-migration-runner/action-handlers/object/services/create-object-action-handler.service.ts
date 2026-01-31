import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { CreateObjectAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object/types/workspace-migration-object-action';
import { TranspileActionUniversalToFlat } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/transpile-action-to-flat.type';
import { fromUniversalFlatFieldMetadataToNakedFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/from-universal-flat-field-metadata-to-naked-field-metadata.util';
import { fromUniversalFlatObjectMetadataToNakedObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/object/services/utils/from-universal-flat-object-metadata-to-naked-object-metadata.util';
import { WorkspaceMigrationActionRunnerContext, type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
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
    context: WorkspaceMigrationActionRunnerArgs<CreateObjectAction>,
  ): Promise<TranspileActionUniversalToFlat<CreateObjectAction>> {
    const { action, queryRunner, workspaceId, allFlatEntityMaps } = context;

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
      allFieldIdToBeCreatedInActionByUniversalIdentifierMap.set(
        universalFlatFieldMetadata.universalIdentifier,
        v4(), // TODO should be configurable for API_METADATA
      );
    }

    const flatObjectMetadata =
      fromUniversalFlatObjectMetadataToNakedObjectMetadata({
        allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
        allFlatEntityMaps,
        context,
        dataSourceId: lastDataSourceMetadata.id,
        generatedId: v4(), // TODO should be configurable for API_METADATA
        universalFlatObjectMetadata: action.flatEntity,
      });

    const flatFieldMetadatas = action.universalFlatFieldMetadatas.map(
      (universalFlatFieldMetadata) =>
        fromUniversalFlatFieldMetadataToNakedFieldMetadata({
          objectMetadataId: flatObjectMetadata.id,
          universalFlatFieldMetadata,
          allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
          allFlatEntityMaps,
          context,
        }),
    );

    return {
      ...action,
      flatEntity: flatObjectMetadata,
      universalFlatFieldMetadatas: flatFieldMetadatas,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<CreateObjectAction>,
  ): Promise<void> {
    const { action, queryRunner, flatAction } = context;
    const {
      flatEntity: flatObjectMetadata,
      universalFlatFieldMetadatas: flatFieldMetadatas,
    } = flatAction;

    const objectMetadataRepository =
      queryRunner.manager.getRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      );

    await objectMetadataRepository.insert(flatObjectMetadata);

    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    await fieldMetadataRepository.insert(flatFieldMetadatas);
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<CreateObjectAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const {
      flatEntity: universalFlatObjectMetadata,
      universalFlatFieldMetadatas,
    } = action;

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: universalFlatObjectMetadata,
    });

    const columnDefinitions = universalFlatFieldMetadatas.flatMap(
      (universalFlatFieldMetadata) =>
        generateColumnDefinitions({
          universalFlatFieldMetadata,
          universalFlatObjectMetadata,
          workspaceId,
        }),
    );

    const enumOrCompositeUniversalFlatFieldMetadatas =
      universalFlatFieldMetadatas.filter(
        (universalFlatFieldMetadata) =>
          isEnumUniversalFlatFieldMetadata(universalFlatFieldMetadata) ||
          isCompositeUniversalFlatFieldMetadata(universalFlatFieldMetadata),
      );

    const enumOperations = collectEnumOperationsForObject({
      universalFlatFieldMetadatas: enumOrCompositeUniversalFlatFieldMetadatas,
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
