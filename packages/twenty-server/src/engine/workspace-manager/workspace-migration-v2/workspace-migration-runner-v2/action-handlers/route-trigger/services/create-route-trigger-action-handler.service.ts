import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { CreateRouteTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/route-trigger/types/workspace-migration-route-trigger-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateRouteTriggerActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'routeTrigger',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateRouteTriggerAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntity: routeTrigger } = action;

    const routeTriggerRepository =
      queryRunner.manager.getRepository<RouteTriggerEntity>(RouteTriggerEntity);

    await routeTriggerRepository.insert({
      ...routeTrigger,
      workspaceId,
    });
  }
}
