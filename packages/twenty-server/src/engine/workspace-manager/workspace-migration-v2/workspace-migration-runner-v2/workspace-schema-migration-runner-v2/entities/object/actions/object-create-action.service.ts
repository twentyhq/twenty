import { type WorkspaceMigrationActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/core/interfaces/workspace-migration-action-service.interface';

import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type CreateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { WorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/core/decorators/workspace-migration-action-handler.decorator';
import { type SchemaActionContext } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/core/types/schema-action-context.type';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/generate-column-definitions.util';
import {
  collectEnumOperationsForObject,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/workspace-schema-enum-operations.util';

@WorkspaceMigrationActionHandler('create_object')
export class ObjectCreateActionService
  implements WorkspaceMigrationActionService<CreateObjectAction>
{
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {}

  async execute(
    context: SchemaActionContext<CreateObjectAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { flatObjectMetadataWithoutFields, createFieldActions } = action;

    const flatObjectMetadata = flatObjectMetadataWithoutFields;
    const schemaName = getWorkspaceSchemaName(flatObjectMetadata.workspaceId);
    const tableName = computeObjectTargetTable(flatObjectMetadata);

    const columnDefinitions = createFieldActions.flatMap((createFieldAction) =>
      generateColumnDefinitions({
        flatFieldMetadata: createFieldAction.flatFieldMetadata,
        flatObjectMetadataWithoutFields: flatObjectMetadataWithoutFields,
      }),
    );

    const enumOrCompositeFlatFieldMetadatas = createFieldActions
      .map((createFieldAction) => createFieldAction.flatFieldMetadata)
      .filter((field): field is FlatFieldMetadata => field != null)
      .filter(
        (field) =>
          isEnumFlatFieldMetadata(field) || isCompositeFlatFieldMetadata(field),
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
