import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { UpdateCronTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/cron-trigger/types/workspace-migration-cron-trigger-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateCronTriggerActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'cronTrigger',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateCronTriggerAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { entityId } = action;

    const cronTriggerRepository =
      queryRunner.manager.getRepository<CronTriggerEntity>(CronTriggerEntity);

    await cronTriggerRepository.update(
      entityId,
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    );
  }
}
