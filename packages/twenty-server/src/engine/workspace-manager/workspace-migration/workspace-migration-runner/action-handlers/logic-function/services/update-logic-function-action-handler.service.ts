import { Inject, Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';

import type { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import {
  LogicFunctionEntity,
  LogicFunctionExecutionMode,
} from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { shouldReinstallLogicFunctionPrebuiltBundle } from 'src/engine/metadata-modules/logic-function/utils/should-reinstall-logic-function-prebuilt-bundle.util';
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
  constructor(
    private readonly fileStorageService: FileStorageService,
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {
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
    const {
      flatAction,
      queryRunner,
      workspaceId,
      allFlatEntityMaps,
      flatApplication,
    } = context;
    const { entityId, update } = flatAction;

    const existingLogicFunction =
      findFlatEntityByIdInFlatEntityMapsOrThrow<FlatLogicFunction>({
        flatEntityMaps: allFlatEntityMaps.flatLogicFunctionMaps,
        flatEntityId: entityId,
      });

    const applicationUniversalIdentifier = flatApplication.universalIdentifier;

    const builtPathChanged =
      isDefined(update.builtHandlerPath) &&
      update.builtHandlerPath !== existingLogicFunction.builtHandlerPath;

    const logicFunctionRepository =
      queryRunner.manager.getRepository<LogicFunctionEntity>(
        LogicFunctionEntity,
      );

    await logicFunctionRepository.update(
      { id: entityId, workspaceId },
      update as Parameters<typeof logicFunctionRepository.update>[1],
    );

    await this.installPrebuiltBundleIfNeeded({
      existingLogicFunction,
      update,
      applicationUniversalIdentifier,
      context,
    });

    if (builtPathChanged) {
      // TODO(install-perf): temporary, remove.
      const deleteFileStart = performance.now();

      await this.fileStorageService.deleteFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: existingLogicFunction.builtHandlerPath,
      });

      const deleteFileMs = performance.now() - deleteFileStart;

      this.logger.log(
        `[install-perf] update logicFunction fileStorageService.deleteFile took ${deleteFileMs.toFixed(1)}ms (fnId=${entityId})`,
        UpdateLogicFunctionActionHandlerService.name,
      );
    }
  }

  private async installPrebuiltBundleIfNeeded({
    existingLogicFunction,
    update,
    applicationUniversalIdentifier,
    context,
  }: {
    existingLogicFunction: FlatLogicFunction;
    update: FlatUpdateLogicFunctionAction['update'];
    applicationUniversalIdentifier: string;
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateLogicFunctionAction>;
  }): Promise<void> {
    const newLogicFunction: FlatLogicFunction = {
      ...existingLogicFunction,
      ...update,
      executionMode:
        update.executionMode ?? existingLogicFunction.executionMode,
      isBuildUpToDate:
        update.isBuildUpToDate ?? existingLogicFunction.isBuildUpToDate,
      checksum: update.checksum ?? existingLogicFunction.checksum,
    };

    if (
      !shouldReinstallLogicFunctionPrebuiltBundle({
        existingLogicFunction,
        newLogicFunction,
      })
    ) {
      return;
    }

    const becamePrebuilt =
      existingLogicFunction.executionMode !==
      LogicFunctionExecutionMode.PREBUILT;

    const driver = this.logicFunctionDriverFactory.getCurrentDriver();

    const installStart = Date.now();

    try {
      await driver.installPrebuiltBundle({
        flatLogicFunction: {
          ...newLogicFunction,
          executionMode: LogicFunctionExecutionMode.PREBUILT,
          isBuildUpToDate: true,
        },
        flatApplication: context.flatApplication,
        applicationUniversalIdentifier,
      });

      this.logger.log(
        `[lambda-timing] event=install_prebuilt fnId=${existingLogicFunction.id} ` +
          `reason=${becamePrebuilt ? 'mode_flip' : 'checksum_change'} ` +
          `install_duration_ms=${Date.now() - installStart}`,
        UpdateLogicFunctionActionHandlerService.name,
      );
    } catch (error) {
      this.logger.error(
        `Failed to install prebuilt bundle for function ${existingLogicFunction.id} ` +
          `after ${Date.now() - installStart}ms: ` +
          `${error instanceof Error ? error.message : String(error)}`,
        UpdateLogicFunctionActionHandlerService.name,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
