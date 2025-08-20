import { createWorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/interfaces/workspace-migration-action-service.interface';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { type WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { type UpdateObjectAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { prepareWorkspaceSchemaContext } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/workspace-schema-context.util';
import {
  collectEnumOperationsForObject,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/workspace-schema-enum-operations.util';

export class UpdateObjectActionHandlerService extends createWorkspaceMigrationActionHandler(
  'update_object',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  async execute(
    context: WorkspaceMigrationActionRunnerArgs<UpdateObjectAction>,
  ): Promise<void> {
    const { action, queryRunner, flatObjectMetadataMaps } = context;
    const { objectMetadataId, updates } = action;
    const {
      schemaName,
      tableName: currentTableName,
      flatObjectMetadataWithFlatFieldMaps,
    } = prepareWorkspaceSchemaContext({
      flatObjectMetadataMaps,
      objectMetadataId,
    });

    for (const update of updates) {
      if (update.property !== 'nameSingular') {
        continue;
      }

      const updatedObjectMetadata = {
        ...flatObjectMetadataWithFlatFieldMaps,
        [update.property]: update.to,
      };

      const newTableName = computeObjectTargetTable(updatedObjectMetadata);

      if (currentTableName !== newTableName) {
        await this.workspaceSchemaManagerService.tableManager.renameTable({
          queryRunner,
          schemaName,
          oldTableName: currentTableName,
          newTableName,
        });

        const enumOrCompositeFlatFieldMetadatas = Object.values(
          flatObjectMetadataWithFlatFieldMaps.fieldsById,
        )
          .filter((field): field is FlatFieldMetadata => field != null)
          .filter(
            (field) =>
              isEnumFlatFieldMetadata(field) ||
              isCompositeFlatFieldMetadata(field),
          );

        const enumOperations = collectEnumOperationsForObject({
          flatFieldMetadatas: enumOrCompositeFlatFieldMetadatas,
          tableName: currentTableName,
          operation: EnumOperation.RENAME,
          options: {
            newTableName,
          },
        });

        await executeBatchEnumOperations({
          enumOperations,
          queryRunner,
          schemaName,
          workspaceSchemaManagerService: this.workspaceSchemaManagerService,
        });
      }
    }
  }
}
