import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { DeleteDatabaseEventTriggerAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/database-event-trigger/types/workspace-migration-database-event-trigger-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteDatabaseEventTriggerActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'databaseEventTrigger',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteDatabaseEventTriggerAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId, allFlatEntityMaps } = context;
    const { universalIdentifier } = action;

    const flatDatabaseEventTrigger = findFlatEntityByUniversalIdentifierOrThrow(
      {
        flatEntityMaps: allFlatEntityMaps.flatDatabaseEventTriggerMaps,
        universalIdentifier,
      },
    );

    const databaseEventTriggerRepository =
      queryRunner.manager.getRepository<DatabaseEventTriggerEntity>(
        DatabaseEventTriggerEntity,
      );

    await databaseEventTriggerRepository.delete({
      id: flatDatabaseEventTrigger.id,
      workspaceId,
    });
  }
}
