import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RouteTrigger } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { DeleteRouteTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-route-trigger-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteRouteTriggerActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_route_trigger',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteRouteTriggerAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { routeTriggerId } = action;

    const routeTriggerRepository =
      queryRunner.manager.getRepository<RouteTrigger>(RouteTrigger);

    await routeTriggerRepository.delete({
      id: routeTriggerId,
      workspaceId,
    });
  }
}
