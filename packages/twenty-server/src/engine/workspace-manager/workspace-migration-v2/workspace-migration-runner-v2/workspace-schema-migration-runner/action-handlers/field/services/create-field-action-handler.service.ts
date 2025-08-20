import { createWorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/interfaces/workspace-migration-action-service.interface';

import { type WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { type CreateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/generate-column-definitions.util';
import { prepareWorkspaceSchemaContext } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/workspace-schema-context.util';
import {
  collectEnumOperationsForField,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/workspace-schema-enum-operations.util';

export class CreateFieldActionHandlerService extends createWorkspaceMigrationActionHandler(
  'create_field',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  async execute(
    context: WorkspaceMigrationActionRunnerArgs<CreateFieldAction>,
  ): Promise<void> {
    const { action, queryRunner, flatObjectMetadataMaps } = context;
    const { flatFieldMetadata } = action;
    const {
      schemaName,
      tableName,
      flatObjectMetadataWithFlatFieldMaps: flatObjectMetadata,
    } = prepareWorkspaceSchemaContext({
      flatObjectMetadataMaps,
      objectMetadataId: flatFieldMetadata.objectMetadataId,
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
      flatObjectMetadataWithoutFields: flatObjectMetadata,
    });

    await this.workspaceSchemaManagerService.columnManager.addColumns({
      queryRunner,
      schemaName,
      tableName,
      columnDefinitions,
    });
  }
}
