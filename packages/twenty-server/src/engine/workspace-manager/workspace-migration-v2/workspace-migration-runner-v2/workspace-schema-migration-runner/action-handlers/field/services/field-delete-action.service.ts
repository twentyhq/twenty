import { type WorkspaceMigrationActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/interfaces/workspace-migration-action-service.interface';

import { findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { type DeleteFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { WorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/decorators/workspace-migration-action-handler.decorator';
import { type SchemaActionContext } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/types/schema-action-context.type';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/generate-column-definitions.util';
import { prepareFieldWorkspaceSchemaContext } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/workspace-schema-context.util';
import {
  collectEnumOperationsForField,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/workspace-schema-enum-operations.util';

@WorkspaceMigrationActionHandler('delete_field')
export class FieldDeleteActionService
  implements WorkspaceMigrationActionService<DeleteFieldAction>
{
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {}

  async execute(
    context: SchemaActionContext<DeleteFieldAction>,
  ): Promise<void> {
    const { action, queryRunner, flatObjectMetadataMaps } = context;
    const { objectMetadataId, fieldMetadataId } = action;

    const { schemaName, tableName, fieldMetadata } =
      prepareFieldWorkspaceSchemaContext({
        flatObjectMetadataMaps,
        objectMetadataId,
        fieldMetadataId,
      });

    const flatObjectMetadata =
      findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps,
        objectMetadataId,
      });

    const columnDefinitions = generateColumnDefinitions({
      flatFieldMetadata: fieldMetadata,
      flatObjectMetadataWithoutFields: flatObjectMetadata,
    });
    const columnNamesToDrop = columnDefinitions.map((def) => def.name);

    await this.workspaceSchemaManagerService.columnManager.dropColumns({
      queryRunner,
      schemaName,
      tableName,
      columnNames: columnNamesToDrop,
    });

    const enumOperations = collectEnumOperationsForField({
      flatFieldMetadata: fieldMetadata,
      tableName,
      operation: EnumOperation.DROP,
    });

    await executeBatchEnumOperations({
      enumOperations,
      queryRunner,
      schemaName,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
    });
  }
}
