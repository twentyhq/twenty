import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getLogicFunctionFolderOrThrow } from 'src/engine/core-modules/logic-function-executor/utils/get-logic-function-folder-or-throw.utils';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { DeleteLogicFunctionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteLogicFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'logicFunction',
) {
  constructor(private readonly fileStorageService: FileStorageService) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteLogicFunctionAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId, allFlatEntityMaps } = context;
    const { universalIdentifier } = action;

    const flatLogicFunction = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatLogicFunctionMaps,
      universalIdentifier,
    });

    const logicFunctionRepository =
      queryRunner.manager.getRepository<LogicFunctionEntity>(
        LogicFunctionEntity,
      );

    await logicFunctionRepository.delete({
      id: flatLogicFunction.id,
      workspaceId,
    });

    // TODO: Should implement a cron task or a job to delete the files after a certain period of time
    await this.fileStorageService.move({
      from: {
        folderPath: getLogicFunctionFolderOrThrow({
          flatLogicFunction,
          fileFolder: FileFolder.LogicFunction,
        }),
      },
      to: {
        folderPath: getLogicFunctionFolderOrThrow({
          flatLogicFunction,
          fileFolder: FileFolder.LogicFunctionToDelete,
        }),
      },
    });

    // We can delete built code as it can be computed from source code if rollback occurs
    await this.fileStorageService.delete({
      folderPath: getLogicFunctionFolderOrThrow({
        flatLogicFunction,
        fileFolder: FileFolder.BuiltFunction,
      }),
    });
  }

  async rollbackForMetadata(
    context: Omit<
      WorkspaceMigrationActionRunnerArgs<DeleteLogicFunctionAction>,
      'queryRunner'
    >,
  ): Promise<void> {
    const { action, allFlatEntityMaps } = context;
    const { universalIdentifier } = action;

    const flatLogicFunction = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatLogicFunctionMaps,
      universalIdentifier,
    });

    await this.fileStorageService.move({
      from: {
        folderPath: getLogicFunctionFolderOrThrow({
          flatLogicFunction,
          fileFolder: FileFolder.LogicFunctionToDelete,
        }),
      },
      to: {
        folderPath: getLogicFunctionFolderOrThrow({
          flatLogicFunction,
          fileFolder: FileFolder.LogicFunction,
        }),
      },
    });
  }
}
