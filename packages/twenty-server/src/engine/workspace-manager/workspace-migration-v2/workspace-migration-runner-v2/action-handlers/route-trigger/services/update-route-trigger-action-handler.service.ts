import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RouteTrigger } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { UpdateRouteTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-route-trigger-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';

@Injectable()
export class UpdateRouteTriggerActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_route_trigger',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateRouteTriggerAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { routeTriggerId } = action;

    const routeTriggerRepository =
      queryRunner.manager.getRepository<RouteTrigger>(RouteTrigger);

    await routeTriggerRepository.update(
      routeTriggerId,
      fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    );
  }
}
