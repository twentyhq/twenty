import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { UpdateDatabaseEventTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/database-event-trigger/types/workspace-migration-database-event-trigger-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateDatabaseEventTriggerActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'databaseEventTrigger',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateDatabaseEventTriggerAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { entityId } = action;

    const databaseEventTriggerRepository =
      queryRunner.manager.getRepository<DatabaseEventTriggerEntity>(
        DatabaseEventTriggerEntity,
      );

    await databaseEventTriggerRepository.update(
      entityId,
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    );
  }
}
