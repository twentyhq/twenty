import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateLogicFunctionAction,
  UniversalUpdateLogicFunctionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateLogicFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'logicFunction',
) {
  constructor(private readonly fileStorageService: FileStorageService) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateLogicFunctionAction>,
  ): Promise<FlatUpdateLogicFunctionAction> {
    const { action, allFlatEntityMaps } = context;

    const flatLogicFunction = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatLogicFunctionMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'logicFunction',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'logicFunction',
      entityId: flatLogicFunction.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateLogicFunctionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, flatApplication, workspaceId } = context;
    const { entityId, update } = flatAction;

    const logicFunctionRepository =
      queryRunner.manager.getRepository<LogicFunctionEntity>(
        LogicFunctionEntity,
      );

    await logicFunctionRepository.update({ id: entityId, workspaceId }, update);

    const flatLogicFunction = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: entityId,
      flatEntityMaps: context.allFlatEntityMaps.flatLogicFunctionMaps,
    });

    const applicationUniversalIdentifier = flatApplication.universalIdentifier;

    if (update.checksum) {
      await this.verifySourceAndBuiltFilesExist({
        flatLogicFunction,
        applicationUniversalIdentifier,
      });
    }
  }

  private async verifySourceAndBuiltFilesExist({
    flatLogicFunction,
    applicationUniversalIdentifier,
  }: {
    flatLogicFunction: FlatLogicFunction;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const builtExists = await this.fileStorageService.checkFileExists({
      workspaceId: flatLogicFunction.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: flatLogicFunction.builtHandlerPath,
    });

    if (!builtExists) {
      throw new LogicFunctionException(
        'Logic function source or built file missing before update',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_READY,
      );
    }
  }
}
