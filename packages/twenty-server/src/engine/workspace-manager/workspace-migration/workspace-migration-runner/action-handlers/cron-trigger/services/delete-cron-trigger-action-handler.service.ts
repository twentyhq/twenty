import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { DeleteCronTriggerAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/cron-trigger/types/workspace-migration-cron-trigger-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteCronTriggerActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'cronTrigger',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteCronTriggerAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId, allFlatEntityMaps } = context;
    const { universalIdentifier } = action;

    const flatCronTrigger = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatCronTriggerMaps,
      universalIdentifier,
    });

    const cronTriggerRepository =
      queryRunner.manager.getRepository<CronTriggerEntity>(CronTriggerEntity);

    await cronTriggerRepository.delete({
      id: flatCronTrigger.id,
      workspaceId,
    });
  }
}
