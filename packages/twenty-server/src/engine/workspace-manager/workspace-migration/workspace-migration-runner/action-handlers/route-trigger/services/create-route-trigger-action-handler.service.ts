import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { CreateRouteTriggerAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/route-trigger/types/workspace-migration-route-trigger-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

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
