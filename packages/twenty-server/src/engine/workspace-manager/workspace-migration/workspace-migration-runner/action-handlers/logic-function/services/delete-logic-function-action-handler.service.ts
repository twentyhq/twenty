import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { LOGIC_FUNCTION_CODE_SOURCE_PREFIX } from 'src/engine/metadata-modules/logic-function/constants/logic-function-code-source-prefix.constant';
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

    const sourceFolderPath = `workspace-${workspaceId}/${FileFolder.Source}/${LOGIC_FUNCTION_CODE_SOURCE_PREFIX}/${flatLogicFunction.id}`;
    const builtFolderPath = `workspace-${workspaceId}/${FileFolder.BuiltLogicFunction}/${flatLogicFunction.id}`;

    await this.fileStorageService.delete({ folderPath: sourceFolderPath });
    await this.fileStorageService.delete({ folderPath: builtFolderPath });
  }

  async rollbackForMetadata(): Promise<void> {
    // Source code and built files are deleted permanently - rollback rebuilds from entity code
  }
}
