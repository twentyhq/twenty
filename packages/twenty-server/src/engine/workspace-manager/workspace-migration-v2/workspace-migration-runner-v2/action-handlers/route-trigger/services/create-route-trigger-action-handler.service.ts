import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RouteTrigger } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { CreateRouteTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-route-trigger-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateRouteTriggerActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_route_trigger',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateRouteTriggerAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { routeTrigger } = action;

    const routeTriggerRepository =
      queryRunner.manager.getRepository<RouteTrigger>(RouteTrigger);

    await routeTriggerRepository.insert({
      ...routeTrigger,
      workspaceId,
    });
  }
}
