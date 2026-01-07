import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { DeleteServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/serverless-function/types/workspace-migration-serverless-function-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

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
    const { action, queryRunner, workspaceId } = context;
    const { entityId } = action;

    const serverlessFunctionRepository =
      queryRunner.manager.getRepository<ServerlessFunctionEntity>(
        ServerlessFunctionEntity,
      );

    await serverlessFunctionRepository.delete({
      id: entityId,
      workspaceId,
    });

    const existingServerlessFunction =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: entityId,
        flatEntityMaps: context.allFlatEntityMaps.flatServerlessFunctionMaps,
      });

    // TODO: Should implement a cron task or a job to delete the files after a certain period of time
    await this.fileStorageService.move({
      from: {
        folderPath: getServerlessFolder({
          serverlessFunction: existingServerlessFunction,
        }),
      },
      to: {
        folderPath: getServerlessFolder({
          serverlessFunction: existingServerlessFunction,
          toDelete: true,
        }),
      },
    });
  }

  async rollbackForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteServerlessFunctionAction>,
  ): Promise<void> {
    const { action } = context;
    const { entityId } = action;

    const existingServerlessFunction =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: entityId,
        flatEntityMaps: context.allFlatEntityMaps.flatServerlessFunctionMaps,
      });

    await this.fileStorageService.move({
      from: {
        folderPath: getServerlessFolder({
          serverlessFunction: existingServerlessFunction,
          toDelete: true,
        }),
      },
      to: {
        folderPath: getServerlessFolder({
          serverlessFunction: existingServerlessFunction,
          toDelete: false,
        }),
      },
    });
  }
}
