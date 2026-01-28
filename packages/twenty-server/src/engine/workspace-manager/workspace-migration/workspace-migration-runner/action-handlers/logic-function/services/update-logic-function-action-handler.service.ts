import { Injectable } from '@nestjs/common';

import { type Sources } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function-executor/logic-function-executor.service';
import { getLogicFunctionFolderOrThrow } from 'src/engine/core-modules/logic-function-executor/utils/get-logic-function-folder-or-throw.utils';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { UpdateLogicFunctionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-flat-entity-properties-updates-to-partial-flat-entity';
import { FunctionBuildService } from 'src/engine/metadata-modules/function-build/function-build.service';

@Injectable()
export class UpdateLogicFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'logicFunction',
) {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly functionBuildService: FunctionBuildService,
  ) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateLogicFunctionAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { entityId, code } = action;

    const logicFunctionRepository =
      queryRunner.manager.getRepository<LogicFunctionEntity>(
        LogicFunctionEntity,
      );

    await logicFunctionRepository.update(
      entityId,
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    );

    const flatLogicFunction = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: entityId,
      flatEntityMaps: context.allFlatEntityMaps.flatLogicFunctionMaps,
    });

    for (const update of action.updates) {
      if (update.property === 'checksum' && isDefined(code)) {
        await this.handleChecksumUpdate({
          flatLogicFunction,
          code,
        });
      }
      if (update.property === 'deletedAt' && isDefined(update.to)) {
        await this.handleDeletedAtUpdate({
          flatLogicFunction,
        });
      }
    }
  }

  async handleDeletedAtUpdate({
    flatLogicFunction,
  }: {
    flatLogicFunction: FlatLogicFunction;
  }) {
    this.logicFunctionExecutorService.delete(flatLogicFunction);
  }

  async handleChecksumUpdate({
    flatLogicFunction,
    code,
  }: {
    flatLogicFunction: FlatLogicFunction;
    code: Sources;
  }) {
    const fileFolder = getLogicFunctionFolderOrThrow({
      flatLogicFunction,
      version: 'draft',
    });

    await this.fileStorageService.writeFolder(code, fileFolder);

    await this.functionBuildService.buildAndUpload({
      flatLogicFunction,
      version: 'draft',
    });
  }
}
