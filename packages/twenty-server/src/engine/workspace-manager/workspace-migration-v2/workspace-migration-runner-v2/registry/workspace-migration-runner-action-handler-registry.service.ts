import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { type WorkspaceMigrationRunnerActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import {
  type WorkspaceMigrationActionTypeV2,
  type WorkspaceMigrationActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/decorators/workspace-migration-runner-action-handler.decorator';
import {
  WorkspaceSchemaMigrationException,
  WorkspaceSchemaMigrationExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/exceptions/workspace-schema-migration.exception';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class WorkspaceMigrationRunnerActionHandlerRegistryService
  implements OnModuleInit
{
  private readonly actionHandlers = new Map<
    WorkspaceMigrationActionTypeV2,
    WorkspaceMigrationRunnerActionHandlerService<WorkspaceMigrationActionTypeV2>
  >();

  constructor(private readonly discoveryService: DiscoveryService) {}

  async onModuleInit() {
    this.discoverAndRegisterActionHandlers();
  }

  private discoverAndRegisterActionHandlers(): void {
    const providers = this.discoveryService.getProviders({
      include: [WorkspaceSchemaMigrationRunnerActionHandlersModule],
    });

    providers.forEach((wrapper) => {
      const { instance, metatype } = wrapper;

      if (!instance || !metatype) return;

      const actionType = Reflect.getMetadata(
        WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA,
        metatype,
      );

      if (actionType && instance.execute) {
        this.actionHandlers.set(actionType, instance);
      }
    });
  }

  async executeActionHandler<T extends WorkspaceMigrationActionV2>(
    actionType: WorkspaceMigrationActionTypeV2,
    context: WorkspaceMigrationActionRunnerArgs<T>,
  ): Promise<void> {
    const handler = this.actionHandlers.get(actionType);

    if (!handler) {
      throw new WorkspaceSchemaMigrationException(
        `No migration runner action handler found for action: ${actionType}`,
        WorkspaceSchemaMigrationExceptionCode.INVALID_ACTION_TYPE,
      );
    }

    await handler.execute(context);
  }
}
