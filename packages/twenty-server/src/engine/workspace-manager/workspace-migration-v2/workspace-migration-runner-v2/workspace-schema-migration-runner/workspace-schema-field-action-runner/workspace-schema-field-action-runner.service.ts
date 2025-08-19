import { Injectable } from '@nestjs/common';

import {
  UpdateFieldAction,
  type CreateFieldAction,
  type DeleteFieldAction,
  type WorkspaceMigrationFieldActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { type RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { WorkspaceSchemaFieldCreateActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-field-action-runner/actions/workspace-schema-field-create-action-runner.service';
import { WorkspaceSchemaFieldDeleteActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-field-action-runner/actions/workspace-schema-field-delete-action-runner.service';
import { WorkspaceSchemaFieldUpdateActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-field-action-runner/actions/workspace-schema-field-update-action-runner.service';

@Injectable()
export class WorkspaceSchemaFieldActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationFieldActionTypeV2, 'schema'>
{
  constructor(
    private readonly workspaceSchemaFieldDeleteActionRunnerService: WorkspaceSchemaFieldDeleteActionRunnerService,
    private readonly workspaceSchemaFieldCreateActionRunnerService: WorkspaceSchemaFieldCreateActionRunnerService,
    private readonly workspaceSchemaFieldUpdateActionRunnerService: WorkspaceSchemaFieldUpdateActionRunnerService,
  ) {}

  runDeleteFieldSchemaMigration = async ({
    action,
    queryRunner,
    flatObjectMetadataMaps,
  }: WorkspaceMigrationActionRunnerArgs<DeleteFieldAction>) => {
    await this.workspaceSchemaFieldDeleteActionRunnerService.run({
      action,
      queryRunner,
      flatObjectMetadataMaps,
    });
  };

  runCreateFieldSchemaMigration = async ({
    action,
    queryRunner,
    flatObjectMetadataMaps,
  }: WorkspaceMigrationActionRunnerArgs<CreateFieldAction>) => {
    await this.workspaceSchemaFieldCreateActionRunnerService.run({
      action,
      queryRunner,
      flatObjectMetadataMaps,
    });
  };

  runUpdateFieldSchemaMigration = async ({
    action,
    queryRunner,
    flatObjectMetadataMaps,
  }: WorkspaceMigrationActionRunnerArgs<UpdateFieldAction>) => {
    await this.workspaceSchemaFieldUpdateActionRunnerService.run({
      action,
      queryRunner,
      flatObjectMetadataMaps,
    });
  };
}
