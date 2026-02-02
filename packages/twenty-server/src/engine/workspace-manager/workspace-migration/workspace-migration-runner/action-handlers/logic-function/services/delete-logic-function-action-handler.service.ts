import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { getLogicFunctionBaseFolderPath } from 'src/engine/core-modules/logic-function/logic-function-build/utils/get-logic-function-base-folder-path.util';
import {
  FlatDeleteLogicFunctionAction,
  UniversalDeleteLogicFunctionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteLogicFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'logicFunction',
) {
  constructor(private readonly fileStorageService: FileStorageService) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteLogicFunctionAction>,
  ): Promise<FlatDeleteLogicFunctionAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteLogicFunctionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId, allFlatEntityMaps } = context;

    const flatLogicFunction = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatLogicFunctionMaps,
      flatEntityId: flatAction.entityId,
    });

    const logicFunctionRepository =
      queryRunner.manager.getRepository<LogicFunctionEntity>(
        LogicFunctionEntity,
      );

    await logicFunctionRepository.delete({
      id: flatAction.entityId,
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
