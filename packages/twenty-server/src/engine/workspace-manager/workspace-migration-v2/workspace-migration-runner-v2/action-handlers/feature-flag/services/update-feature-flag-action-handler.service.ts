import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { UpdateFeatureFlagAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/feature-flag/types/workspace-migration-feature-flag-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateFeatureFlagActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_feature_flag',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateFeatureFlagAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { featureFlagId } = action;

    const featureFlagRepository =
      queryRunner.manager.getRepository<FeatureFlagEntity>(FeatureFlagEntity);

    await featureFlagRepository.update(
      featureFlagId,
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    );
  }
}
