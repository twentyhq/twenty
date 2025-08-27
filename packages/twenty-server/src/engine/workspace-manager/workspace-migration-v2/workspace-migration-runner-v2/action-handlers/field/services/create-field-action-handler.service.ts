import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-with-flat-field-maps-in-flat-object-metadata-maps-or-throw.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { type CreateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumOperationsForField,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/workspace-schema-enum-operations.util';

@Injectable()
export class CreateFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_field',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateFieldAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    const { flatFieldMetadata } = action;

    await fieldMetadataRepository.save(flatFieldMetadata);
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<CreateFieldAction>,
  ): Promise<void> {
    const { action, queryRunner, flatObjectMetadataMaps, workspaceId } =
      context;
    const { flatFieldMetadata } = action;

    const flatObjectMetadataWithFlatFieldMaps =
      findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps,
        objectMetadataId: flatFieldMetadata.objectMetadataId,
      });

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      flatObjectMetadata: flatObjectMetadataWithFlatFieldMaps,
    });

    const enumOperations = collectEnumOperationsForField({
      flatFieldMetadata: flatFieldMetadata,
      tableName,
      operation: EnumOperation.CREATE,
    });

    await executeBatchEnumOperations({
      enumOperations,
      queryRunner,
      schemaName,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
    });

    const columnDefinitions = generateColumnDefinitions({
      flatFieldMetadata: flatFieldMetadata,
      flatObjectMetadataWithoutFields: flatObjectMetadataWithFlatFieldMaps,
    });

    await this.workspaceSchemaManagerService.columnManager.addColumns({
      queryRunner,
      schemaName,
      tableName,
      columnDefinitions,
    });
  }
}
