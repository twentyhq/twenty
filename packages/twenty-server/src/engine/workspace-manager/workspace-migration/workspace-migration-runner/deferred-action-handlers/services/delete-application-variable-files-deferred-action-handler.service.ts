import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { EntityNotFoundError } from 'typeorm';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { DeferredWorkspaceMigrationActionHandlerDecorator } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-action-handlers/decorators/deferred-workspace-migration-action-handler.decorator';
import { type DeferredWorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-action-handlers/interfaces/deferred-workspace-migration-action-handler.interface';
import { type DeferredWorkspaceMigrationActionExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action-execution-args.type';
import { type DeferredWorkspaceMigrationActionPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';

// Files of a FILES application variable the manifest removed or retyped
@Injectable()
@DeferredWorkspaceMigrationActionHandlerDecorator(
  'delete_applicationVariableFiles',
)
export class DeleteApplicationVariableFilesDeferredActionHandlerService implements DeferredWorkspaceMigrationActionHandler<'delete_applicationVariableFiles'> {
  readonly metadataNamesToLoad = [];

  constructor(private readonly fileStorageService: FileStorageService) {}

  async execute({
    workspaceId,
    payload: { fileIds },
  }: DeferredWorkspaceMigrationActionExecutionArgs<
    DeferredWorkspaceMigrationActionPayload<'delete_applicationVariableFiles'>
  >): Promise<void> {
    for (const fileId of fileIds) {
      try {
        await this.fileStorageService.deleteByFileId({
          fileId,
          workspaceId,
          fileFolder: FileFolder.ApplicationVariable,
        });
      } catch (error) {
        // A retry after a partial run finds some files already gone
        if (error instanceof EntityNotFoundError) {
          continue;
        }

        throw error;
      }
    }
  }
}
