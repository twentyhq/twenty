import { Injectable } from '@nestjs/common';
import { WorkspaceMigrationRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-runner-args.type';
import { WorkspaceMetadataFieldActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-field-action-runner.service';
import { WorkspaceMetadataIndexActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-index-action-runner.service';
import { WorkspaceMetadataObjectActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-metadata-migration-runner/workspace-metadata-object-action-runner.service';
import { assertUnreachable } from 'twenty-shared/utils';

@Injectable()
export class WorkspaceMetadataMigrationRunnerService {
  constructor(
    private readonly workspaceMetadataObjectMigrationRunnerService: WorkspaceMetadataObjectActionRunnerService,
    private readonly workspaceMetadataIndexMigrationRunnerService: WorkspaceMetadataIndexActionRunnerService,
    private readonly workspaceMetadataFieldMigrationRunnerService: WorkspaceMetadataFieldActionRunnerService,
  ) {}

  runWorkspaceMetadataMigration = ({
    workspaceMigration,
    queryRunner,
  }: WorkspaceMigrationRunnerArgs) => {
    for (const action of workspaceMigration.actions) {
      switch (action.type) {
        case 'delete_object': {
          this.workspaceMetadataObjectMigrationRunnerService.runDeleteObjectMetadataMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'create_object': {
          this.workspaceMetadataObjectMigrationRunnerService.runCreateObjectMetadataMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'update_object': {
          this.workspaceMetadataObjectMigrationRunnerService.runUpdateObjectMetadataMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'create_field': {
          this.workspaceMetadataFieldMigrationRunnerService.runCreateFieldMetadataMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'update_field': {
          this.workspaceMetadataFieldMigrationRunnerService.runUpdateFieldMetadataMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'delete_field': {
          this.workspaceMetadataFieldMigrationRunnerService.runDeleteFieldMetadataMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'create_index': {
          this.workspaceMetadataIndexMigrationRunnerService.runCreateIndexMetadataMigration(
            { action, queryRunner },
          );
          break;
        }
        case 'delete_index': {
          this.workspaceMetadataIndexMigrationRunnerService.runDeleteIndexMetadataMigration(
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
