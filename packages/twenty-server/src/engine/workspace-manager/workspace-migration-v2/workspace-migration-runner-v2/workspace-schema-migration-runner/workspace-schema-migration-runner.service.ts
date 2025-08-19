import { Injectable } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import { type WorkspaceMigrationRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-runner-args.type';
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

  runWorkspaceSchemaMigration = async ({
    action,
    queryRunner,
    flatObjectMetadataMaps,
  }: WorkspaceMigrationRunnerArgs) => {
    switch (action.type) {
      case 'delete_object': {
        await this.workspaceSchemaObjectMigrationRunnerService.runDeleteObjectSchemaMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'create_object': {
        await this.workspaceSchemaObjectMigrationRunnerService.runCreateObjectSchemaMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'update_object': {
        await this.workspaceSchemaObjectMigrationRunnerService.runUpdateObjectSchemaMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'create_field': {
        await this.workspaceSchemaFieldMigrationRunnerService.runCreateFieldSchemaMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'update_field': {
        await this.workspaceSchemaFieldMigrationRunnerService.runUpdateFieldSchemaMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'delete_field': {
        await this.workspaceSchemaFieldMigrationRunnerService.runDeleteFieldSchemaMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'create_index': {
        await this.workspaceSchemaIndexMigrationRunnerService.runCreateIndexSchemaMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'delete_index': {
        await this.workspaceSchemaIndexMigrationRunnerService.runDeleteIndexSchemaMigration(
          { action, queryRunner, flatObjectMetadataMaps },
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
  };
}
