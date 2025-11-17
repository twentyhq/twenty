import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { DeleteFeatureFlagAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/feature-flag/types/workspace-migration-feature-flag-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteFeatureFlagActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_feature_flag',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteFeatureFlagAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { featureFlagId } = action;

    const featureFlagRepository =
      queryRunner.manager.getRepository<FeatureFlagEntity>(FeatureFlagEntity);

    await featureFlagRepository.delete({
      id: featureFlagId,
      workspaceId,
    });
  }
}
