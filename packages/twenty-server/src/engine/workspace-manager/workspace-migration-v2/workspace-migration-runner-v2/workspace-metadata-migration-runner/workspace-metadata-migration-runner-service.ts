import { Injectable } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import { type WorkspaceMigrationRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-runner-args.type';
import { WorkspaceMetadataFieldActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-field-action-runner.service';
import { WorkspaceMetadataIndexActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-index-action-runner.service';
import { WorkspaceMetadataObjectActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-object-action-runner.service';

@Injectable()
export class WorkspaceMetadataMigrationRunnerService {
  constructor(
    private readonly workspaceMetadataObjectMigrationRunnerService: WorkspaceMetadataObjectActionRunnerService,
    private readonly workspaceMetadataIndexMigrationRunnerService: WorkspaceMetadataIndexActionRunnerService,
    private readonly workspaceMetadataFieldMigrationRunnerService: WorkspaceMetadataFieldActionRunnerService,
  ) {}

  runWorkspaceMetadataMigration = async ({
    action,
    queryRunner,
    flatObjectMetadataMaps,
  }: WorkspaceMigrationRunnerArgs) => {
    switch (action.type) {
      case 'delete_object': {
        await this.workspaceMetadataObjectMigrationRunnerService.runDeleteObjectMetadataMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'create_object': {
        await this.workspaceMetadataObjectMigrationRunnerService.runCreateObjectMetadataMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'update_object': {
        await this.workspaceMetadataObjectMigrationRunnerService.runUpdateObjectMetadataMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'create_field': {
        await this.workspaceMetadataFieldMigrationRunnerService.runCreateFieldMetadataMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'update_field': {
        await this.workspaceMetadataFieldMigrationRunnerService.runUpdateFieldMetadataMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'delete_field': {
        await this.workspaceMetadataFieldMigrationRunnerService.runDeleteFieldMetadataMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'create_index': {
        await this.workspaceMetadataIndexMigrationRunnerService.runCreateIndexMetadataMigration(
          { action, queryRunner, flatObjectMetadataMaps },
        );
        break;
      }
      case 'delete_index': {
        await this.workspaceMetadataIndexMigrationRunnerService.runDeleteIndexMetadataMigration(
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
