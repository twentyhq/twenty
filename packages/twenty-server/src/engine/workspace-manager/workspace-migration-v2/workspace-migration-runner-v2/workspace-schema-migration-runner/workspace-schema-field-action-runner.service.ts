import { Injectable } from '@nestjs/common';

import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
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
    _action: WorkspaceMigrationActionRunnerArgs<DeleteFieldAction>,
  ) => {
    return;
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

    await this.workspaceSchemaManagerService.columnManager.addColumns(
      queryRunner,
      schemaName,
      tableName,
      columnDefinitions,
    );

    return;
  };
  runUpdateFieldSchemaMigration = async (
    _action: WorkspaceMigrationActionRunnerArgs<UpdateFieldAction>,
  ) => {
    return;
  };
}
