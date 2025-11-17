import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { CreateFeatureFlagAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/feature-flag/types/workspace-migration-feature-flag-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateFeatureFlagActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_feature_flag',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateFeatureFlagAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { featureFlag } = action;

    const featureFlagRepository =
      queryRunner.manager.getRepository<FeatureFlagEntity>(FeatureFlagEntity);

    await featureFlagRepository.insert({
      ...featureFlag,
      workspaceId,
    });
  }
}
