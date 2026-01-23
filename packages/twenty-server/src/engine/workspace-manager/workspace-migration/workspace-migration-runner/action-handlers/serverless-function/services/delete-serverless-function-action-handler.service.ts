import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getServerlessFolderOrThrow } from 'src/engine/core-modules/serverless/utils/get-serverless-folder-or-throw.utils';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { DeleteServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/serverless-function/types/workspace-migration-serverless-function-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteServerlessFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'serverlessFunction',
) {
  constructor(private readonly fileStorageService: FileStorageService) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteServerlessFunctionAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId, allFlatEntityMaps } = context;
    const { universalIdentifier } = action;

    const flatServerlessFunction = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatServerlessFunctionMaps,
      universalIdentifier,
    });

    const serverlessFunctionRepository =
      queryRunner.manager.getRepository<ServerlessFunctionEntity>(
        ServerlessFunctionEntity,
      );

    await serverlessFunctionRepository.delete({
      id: flatServerlessFunction.id,
      workspaceId,
    });

    // TODO: Should implement a cron task or a job to delete the files after a certain period of time
    await this.fileStorageService.move({
      from: {
        folderPath: getServerlessFolderOrThrow({
          flatServerlessFunction,
          fileFolder: FileFolder.ServerlessFunction,
        }),
      },
      to: {
        folderPath: getServerlessFolderOrThrow({
          flatServerlessFunction,
          fileFolder: FileFolder.ServerlessFunctionToDelete,
        }),
      },
    });

    // We can delete built code as it can be computed from source code if rollback occurs
    await this.fileStorageService.delete({
      folderPath: getServerlessFolderOrThrow({
        flatServerlessFunction,
        fileFolder: FileFolder.BuiltFunction,
      }),
    });
  }

  async rollbackForMetadata(
    context: Omit<
      WorkspaceMigrationActionRunnerArgs<DeleteServerlessFunctionAction>,
      'queryRunner'
    >,
  ): Promise<void> {
    const { action, allFlatEntityMaps } = context;
    const { universalIdentifier } = action;

    const flatServerlessFunction = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatServerlessFunctionMaps,
      universalIdentifier,
    });

    await this.fileStorageService.move({
      from: {
        folderPath: getServerlessFolderOrThrow({
          flatServerlessFunction,
          fileFolder: FileFolder.ServerlessFunctionToDelete,
        }),
      },
      to: {
        folderPath: getServerlessFolderOrThrow({
          flatServerlessFunction,
          fileFolder: FileFolder.ServerlessFunction,
        }),
      },
    });
  }
}
