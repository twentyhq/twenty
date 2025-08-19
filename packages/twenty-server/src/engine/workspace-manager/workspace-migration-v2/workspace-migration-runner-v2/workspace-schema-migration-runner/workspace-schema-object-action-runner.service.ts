import { Injectable } from '@nestjs/common';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  type CreateObjectAction,
  type DeleteObjectAction,
  type UpdateObjectAction,
  type WorkspaceMigrationObjectActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { type RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/generate-column-definitions.util';

import { prepareWorkspaceSchemaContext } from './utils/workspace-schema-context.util';
import {
  collectEnumOperationsForObject,
  EnumOperation,
  executeBatchEnumOperations,
} from './utils/workspace-schema-enum-operations.util';

@Injectable()
export class WorkspaceSchemaObjectActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationObjectActionTypeV2, 'schema'>
{
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {}

  runDeleteObjectSchemaMigration = async ({
    action: { objectMetadataId },
    queryRunner,
    flatObjectMetadataMaps,
  }: WorkspaceMigrationActionRunnerArgs<DeleteObjectAction>) => {
    const { schemaName, tableName, flatObjectMetadataWithFlatFieldMaps } =
      prepareWorkspaceSchemaContext({
        flatObjectMetadataMaps,
        objectMetadataId,
      });

    await this.workspaceSchemaManagerService.tableManager.dropTable({
      queryRunner,
      schemaName,
      tableName,
    });

    const enumFlatFieldMetadatas = Object.values(
      flatObjectMetadataWithFlatFieldMaps.fieldsById,
    )
      .filter((field): field is FlatFieldMetadata => field != null)
      .filter((field) => isEnumFlatFieldMetadata(field));

    const enumOperations = collectEnumOperationsForObject({
      flatFieldMetadatas: enumFlatFieldMetadatas,
      tableName,
      operation: EnumOperation.DROP,
    });

    await executeBatchEnumOperations({
      enumOperations,
      queryRunner,
      schemaName,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
    });
  };
  runCreateObjectSchemaMigration = async ({
    action: { flatObjectMetadataWithoutFields, createFieldActions },
    queryRunner,
  }: WorkspaceMigrationActionRunnerArgs<CreateObjectAction>) => {
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
  };

  runUpdateObjectSchemaMigration = async ({
    action,
    queryRunner,
    flatObjectMetadataMaps,
  }: WorkspaceMigrationActionRunnerArgs<UpdateObjectAction>) => {
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
  };
}
