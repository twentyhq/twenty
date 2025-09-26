import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { CreateServerlessFunctionAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-serverless-function-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateServerlessFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_serverless_function',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<CreateServerlessFunctionAction>): Partial<AllFlatEntityMaps> {
    const { flatServerlessFunctionMaps } = allFlatEntityMaps;
    const { serverlessFunction } = action;

    const updatedFlatServerlessFunctionMaps =
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: serverlessFunction,
        flatEntityMaps: flatServerlessFunctionMaps,
      });

    return {
      flatServerlessFunctionMaps: updatedFlatServerlessFunctionMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateServerlessFunctionAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { serverlessFunction } = action;

    const serverlessFunctionRepository =
      queryRunner.manager.getRepository<ServerlessFunctionEntity>(
        ServerlessFunctionEntity,
      );

    await serverlessFunctionRepository.insert({
      ...serverlessFunction,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreateServerlessFunctionAction>,
  ): Promise<void> {
    return;
  }
}
