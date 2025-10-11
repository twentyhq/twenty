import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { CronTrigger } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { CreateCronTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-cron-trigger-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateCronTriggerActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_cron_trigger',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateCronTriggerAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { cronTrigger } = action;

    const cronTriggerRepository =
      queryRunner.manager.getRepository<CronTrigger>(CronTrigger);

    await cronTriggerRepository.insert({
      ...cronTrigger,
      workspaceId,
    });
  }
}
