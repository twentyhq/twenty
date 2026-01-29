import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { getLogicFunctionBaseFolderPath } from 'src/engine/metadata-modules/logic-function/utils/get-logic-function-base-folder-path.util';
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

    const sourceBaseFolderPath = getLogicFunctionBaseFolderPath(
      flatLogicFunction.sourceHandlerPath,
    );
    const builtBaseFolderPath = getLogicFunctionBaseFolderPath(
      flatLogicFunction.builtHandlerPath,
    );

    const sourceFolderPath = `workspace-${workspaceId}/${FileFolder.Source}/${sourceBaseFolderPath}`;
    const builtFolderPath = `workspace-${workspaceId}/${FileFolder.BuiltLogicFunction}/${builtBaseFolderPath}`;

    await this.fileStorageService.delete({ folderPath: sourceFolderPath });
    await this.fileStorageService.delete({ folderPath: builtFolderPath });
  }

  async rollbackForMetadata(): Promise<void> {}
}
