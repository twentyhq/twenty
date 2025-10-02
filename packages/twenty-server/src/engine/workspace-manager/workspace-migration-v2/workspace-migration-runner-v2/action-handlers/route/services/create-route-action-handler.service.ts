import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { Route } from 'src/engine/metadata-modules/route/route.entity';
import { CreateRouteAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-route-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateRouteActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_route',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateRouteAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { route } = action;

    const routeRepository = queryRunner.manager.getRepository<Route>(Route);

    await routeRepository.insert({
      ...route,
      workspaceId,
    });
  }
}
