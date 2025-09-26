import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { UpdateServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-serverless-function-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';

@Injectable()
export class UpdateServerlessFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_serverless_function',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateServerlessFunctionAction>): Partial<AllFlatEntityMaps> {
    const { flatServerlessFunctionMaps } = allFlatEntityMaps;
    const { serverlessFunctionId } = action;

    const existingServerlessFunction =
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: serverlessFunctionId,
        flatEntityMaps: flatServerlessFunctionMaps,
      });

    const updatedServerlessFunction = {
      ...existingServerlessFunction,
      ...fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    };

    const updatedFlatServerlessFunctionMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: updatedServerlessFunction,
        flatEntityMaps: flatServerlessFunctionMaps,
      });

    return {
      flatServerlessFunctionMaps: updatedFlatServerlessFunctionMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateServerlessFunctionAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { serverlessFunctionId } = action;

    const serverlessFunctionRepository =
      queryRunner.manager.getRepository<ServerlessFunctionEntity>(
        ServerlessFunctionEntity,
      );

    await serverlessFunctionRepository.update(
      serverlessFunctionId,
      fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateServerlessFunctionAction>,
  ): Promise<void> {
    return;
  }
}
