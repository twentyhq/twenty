import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getServerlessFolder } from 'src/engine/core-modules/serverless/utils/serverless-get-folder.utils';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { DeleteServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-serverless-function-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteServerlessFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_serverless_function',
) {
  constructor(private readonly fileStorageService: FileStorageService) {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeleteServerlessFunctionAction>): Partial<AllFlatEntityMaps> {
    const { flatServerlessFunctionMaps } = allFlatEntityMaps;
    const { serverlessFunctionId } = action;

    const updatedFlatServerlessFunctionMaps =
      deleteFlatEntityFromFlatEntityMapsOrThrow({
        entityToDeleteId: serverlessFunctionId,
        flatEntityMaps: flatServerlessFunctionMaps,
      });

    return {
      flatServerlessFunctionMaps: updatedFlatServerlessFunctionMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteServerlessFunctionAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { serverlessFunctionId } = action;

    const serverlessFunctionRepository =
      queryRunner.manager.getRepository<ServerlessFunctionEntity>(
        ServerlessFunctionEntity,
      );

    await serverlessFunctionRepository.delete({
      id: serverlessFunctionId,
      workspaceId,
    });

    const existingServerlessFunction =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: serverlessFunctionId,
        flatEntityMaps: context.allFlatEntityMaps.flatServerlessFunctionMaps,
      });

    await this.fileStorageService.delete({
      folderPath: getServerlessFolder({
        serverlessFunction: existingServerlessFunction,
      }),
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteServerlessFunctionAction>,
  ): Promise<void> {
    return;
  }
}
