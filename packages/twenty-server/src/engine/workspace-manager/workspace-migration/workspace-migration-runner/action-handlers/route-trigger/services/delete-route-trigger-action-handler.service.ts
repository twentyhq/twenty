import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { DeleteRouteTriggerAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/route-trigger/types/workspace-migration-route-trigger-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteRouteTriggerActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'routeTrigger',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteRouteTriggerAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId, allFlatEntityMaps } = context;
    const { universalIdentifier } = action;

    const flatRouteTrigger = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatRouteTriggerMaps,
      universalIdentifier,
    });

    const routeTriggerRepository =
      queryRunner.manager.getRepository<RouteTriggerEntity>(RouteTriggerEntity);

    await routeTriggerRepository.delete({
      id: flatRouteTrigger.id,
      workspaceId,
    });
  }
}
