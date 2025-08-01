import { Injectable } from '@nestjs/common';

import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration-runner/utils/compute-postgres-enum-name.util';
import {
  CreateFieldAction,
  DeleteFieldAction,
  UpdateFieldAction,
  WorkspaceMigrationFieldActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { WorkspaceSchemaColumnDefinitionGeneratorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-column-definition-generator.service';

@Injectable()
export class WorkspaceSchemaFieldActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationFieldActionTypeV2, 'schema'>
{
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
    private readonly columnDefinitionGeneratorService: WorkspaceSchemaColumnDefinitionGeneratorService,
  ) {}

  runDeleteFieldSchemaMigration = async (
    actionRunnerArgs: WorkspaceMigrationActionRunnerArgs<DeleteFieldAction>,
  ) => {
    const { action, queryRunner } = actionRunnerArgs;

    const { flatFieldMetadata, flatObjectMetadataWithoutFields } = action;

    const workspaceId = action.flatFieldMetadata.workspaceId;

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tableName = computeObjectTargetTable(flatObjectMetadataWithoutFields);

    await this.workspaceSchemaManagerService.columnManager.dropColumn(
      queryRunner,
      schemaName,
      tableName,
      flatFieldMetadata.name,
    );

    if (isEnumFieldMetadataType(flatFieldMetadata.type)) {
      await this.workspaceSchemaManagerService.enumManager.dropEnum(
        queryRunner,
        schemaName,
        computePostgresEnumName({
          tableName,
          columnName: flatFieldMetadata.name,
        }),
      );
    }
  };

  runCreateFieldSchemaMigration = async (
    actionRunnerArgs: WorkspaceMigrationActionRunnerArgs<CreateFieldAction>,
  ) => {
    const { action, queryRunner } = actionRunnerArgs;

    const { flatFieldMetadata, flatObjectMetadataWithoutFields } = action;

    const workspaceId = action.flatFieldMetadata.workspaceId;

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tableName = computeObjectTargetTable(flatObjectMetadataWithoutFields);

    const columnDefinitions =
      this.columnDefinitionGeneratorService.generateColumnDefinitions([
        flatFieldMetadata,
      ]);

    if (isEnumFieldMetadataType(flatFieldMetadata.type)) {
      await this.workspaceSchemaManagerService.enumManager.createEnum(
        queryRunner,
        schemaName,
        computePostgresEnumName({
          tableName,
          columnName: flatFieldMetadata.name,
        }),
        flatFieldMetadata.options?.map((option) => option.value) ?? [],
      );
    }

    await this.workspaceSchemaManagerService.columnManager.addColumns(
      queryRunner,
      schemaName,
      tableName,
      columnDefinitions,
    );

    return;
  };

  runUpdateFieldSchemaMigration = async (
    actionRunnerArgs: WorkspaceMigrationActionRunnerArgs<UpdateFieldAction>,
  ) => {
    const { action, queryRunner } = actionRunnerArgs;

    const { flatFieldMetadata, flatObjectMetadataWithoutFields, updates } =
      action;

    const workspaceId = action.flatFieldMetadata.workspaceId;
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tableName = computeObjectTargetTable(flatObjectMetadataWithoutFields);
    const columnName = computeColumnName(flatFieldMetadata.name);

    for (const update of updates) {
      if (update.property === 'name') {
        await this.workspaceSchemaManagerService.columnManager.renameColumn(
          queryRunner,
          schemaName,
          tableName,
          update.from,
          update.to,
        );

        if (isEnumFieldMetadataType(flatFieldMetadata.type)) {
          await this.workspaceSchemaManagerService.enumManager.renameEnum(
            queryRunner,
            schemaName,
            computePostgresEnumName({
              tableName,
              columnName: update.from,
            }),
            computePostgresEnumName({
              tableName,
              columnName: update.to,
            }),
          );
        }
      }
      if (update.property === 'defaultValue') {
        const serializedDefaultValue = serializeDefaultValue(update.to);

        await this.workspaceSchemaManagerService.columnManager.alterColumnDefault(
          queryRunner,
          schemaName,
          tableName,
          columnName,
          serializedDefaultValue,
        );
      }
      if (
        update.property === 'options' &&
        isEnumFieldMetadataType(flatFieldMetadata.type)
      ) {
        // TODO: Implement
      }
    }
  };
}
