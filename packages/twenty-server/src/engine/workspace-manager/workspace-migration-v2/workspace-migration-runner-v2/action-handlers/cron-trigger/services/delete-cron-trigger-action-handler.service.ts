import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { CronTrigger } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { DeleteCronTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-cron-trigger-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteCronTriggerActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_cron_trigger',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteCronTriggerAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { cronTriggerId } = action;

    const cronTriggerRepository =
      queryRunner.manager.getRepository<CronTrigger>(CronTrigger);

    await cronTriggerRepository.delete({
      id: cronTriggerId,
      workspaceId,
    });
  }
}
