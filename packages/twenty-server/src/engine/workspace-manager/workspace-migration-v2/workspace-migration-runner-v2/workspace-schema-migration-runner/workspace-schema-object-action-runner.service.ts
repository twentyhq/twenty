import { Injectable } from '@nestjs/common';

import { WorkspaceSchemaTableDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-table-definition.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  CreateObjectAction,
  DeleteObjectAction,
  UpdateObjectAction,
  WorkspaceMigrationObjectActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-object-action-v2';
import { RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { WorkspaceSchemaColumnDefinitionGeneratorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-column-definition-generator.service';

@Injectable()
export class WorkspaceSchemaObjectActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationObjectActionTypeV2, 'schema'>
{
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
    private readonly columnDefinitionGeneratorService: WorkspaceSchemaColumnDefinitionGeneratorService,
  ) {}

  runDeleteObjectSchemaMigration = async (
    actionRunnerArgs: WorkspaceMigrationActionRunnerArgs<DeleteObjectAction>,
  ) => {
    const { action, queryRunner } = actionRunnerArgs;

    const { flatObjectMetadataWithoutFields } = action;

    const workspaceId = flatObjectMetadataWithoutFields.workspaceId;

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tableName = computeObjectTargetTable(flatObjectMetadataWithoutFields);

    await this.workspaceSchemaManagerService.tableManager.dropTable(
      queryRunner,
      schemaName,
      tableName,
    );
  };
  runCreateObjectSchemaMigration = async (
    actionRunnerArgs: WorkspaceMigrationActionRunnerArgs<CreateObjectAction>,
  ) => {
    const { action, queryRunner } = actionRunnerArgs;

    const { flatObjectMetadataWithoutFields, createFieldActions } = action;

    const flatFieldMetadataCollection = createFieldActions.map(
      (action) => action.flatFieldMetadata,
    );

    const workspaceId = flatObjectMetadataWithoutFields.workspaceId;

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tableName = computeObjectTargetTable(flatObjectMetadataWithoutFields);

    const columnDefinitions =
      this.columnDefinitionGeneratorService.generateColumnDefinitions(
        flatFieldMetadataCollection,
      );

    const tableDefinition: WorkspaceSchemaTableDefinition = {
      name: tableName,
      columns: columnDefinitions,
    };

    await this.workspaceSchemaManagerService.tableManager.createTable(
      queryRunner,
      schemaName,
      tableDefinition,
    );

    return;
  };
  runUpdateObjectSchemaMigration = async (
    actionRunnerArgs: WorkspaceMigrationActionRunnerArgs<UpdateObjectAction>,
  ) => {
    const { action, queryRunner } = actionRunnerArgs;

    const { flatObjectMetadataWithoutFields, updates } = action;

    const workspaceId = flatObjectMetadataWithoutFields.workspaceId;

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tableName = computeObjectTargetTable(flatObjectMetadataWithoutFields);

    const tableDefinition: WorkspaceSchemaTableDefinition = {
      name: tableName,
      columns: [],
    };

    for (const update of updates) {
    }
  };
}
