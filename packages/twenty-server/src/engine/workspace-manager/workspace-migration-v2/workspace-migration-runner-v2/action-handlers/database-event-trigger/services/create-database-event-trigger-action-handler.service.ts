import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { DatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { CreateDatabaseEventTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-database-event-trigger-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateDatabaseEventTriggerActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_database_event_trigger',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateDatabaseEventTriggerAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { databaseEventTrigger } = action;

    const databaseEventTriggerRepository =
      queryRunner.manager.getRepository<DatabaseEventTrigger>(
        DatabaseEventTrigger,
      );

    await databaseEventTriggerRepository.insert({
      ...databaseEventTrigger,
      workspaceId,
    });
  }
}
