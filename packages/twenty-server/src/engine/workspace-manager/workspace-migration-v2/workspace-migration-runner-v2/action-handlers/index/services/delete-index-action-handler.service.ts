import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { type DeleteIndexAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-index-action-v2';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteIndexActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_index',
) {
  optimisticallyApplyActionOnAllFlatEntityMaps(
    args: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeleteIndexAction>,
  ): Partial<AllFlatEntityMaps> {
    return {};
  }

  async executeForMetadata(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteIndexAction>,
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteIndexAction>,
  ): Promise<void> {
    throw new Error('Not implemented');
  }
}
