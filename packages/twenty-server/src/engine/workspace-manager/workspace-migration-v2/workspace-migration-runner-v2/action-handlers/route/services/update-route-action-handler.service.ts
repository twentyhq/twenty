import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { Route } from 'src/engine/metadata-modules/route/route.entity';
import { UpdateRouteAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-route-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';

@Injectable()
export class UpdateRouteActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_route',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateRouteAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { routeId } = action;

    const routeRepository = queryRunner.manager.getRepository<Route>(Route);

    await routeRepository.update(
      routeId,
      fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    );
  }
}
