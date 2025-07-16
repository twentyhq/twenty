import { Injectable } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-runner-args.type';
import { WorkspaceSchemaFieldActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-field-action-runner.service';
import { WorkspaceSchemaIndexActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-index-action-runner.service';
import { WorkspaceSchemaObjectActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-object-action-runner.service';

@Injectable()
export class WorkspaceSchemaMigrationRunnerService {
  constructor(
    private readonly workspaceSchemaObjectMigrationRunnerService: WorkspaceSchemaObjectActionRunnerService,
    private readonly workspaceSchemaIndexMigrationRunnerService: WorkspaceSchemaIndexActionRunnerService,
    private readonly workspaceSchemaFieldMigrationRunnerService: WorkspaceSchemaFieldActionRunnerService,
  ) {}

  runWorkspaceSchemaMigration = ({
    workspaceMigration,
    queryRunner,
  }: WorkspaceMigrationRunnerArgs) => {
    for (const action of workspaceMigration.actions) {
      switch (action.type) {
        case 'delete_object': {
          this.workspaceSchemaObjectMigrationRunnerService.runDeleteObjectSchemaMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'create_object': {
          this.workspaceSchemaObjectMigrationRunnerService.runCreateObjectSchemaMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'update_object': {
          this.workspaceSchemaObjectMigrationRunnerService.runUpdateObjectSchemaMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'create_field': {
          this.workspaceSchemaFieldMigrationRunnerService.runCreateFieldSchemaMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'update_field': {
          this.workspaceSchemaFieldMigrationRunnerService.runUpdateFieldSchemaMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'delete_field': {
          this.workspaceSchemaFieldMigrationRunnerService.runDeleteFieldSchemaMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'create_index': {
          this.workspaceSchemaIndexMigrationRunnerService.runCreateIndexSchemaMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'delete_index': {
          this.workspaceSchemaIndexMigrationRunnerService.runDeleteIndexSchemaMigration(
            { action, queryRunner },
          );
          break;
        }
        default: {
          assertUnreachable(
            action,
            'Should never occur, encountered an unsupported workspace migration action type',
          );
        }
      }
    }
  };
}
