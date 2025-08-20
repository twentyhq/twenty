import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryOptions, DiscoveryService } from '@nestjs/core';

import { type WorkspaceMigrationActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/interfaces/workspace-migration-action-service.interface';

import {
  type WorkspaceMigrationActionTypeV2,
  type WorkspaceMigrationActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/decorators/workspace-migration-action-handler.decorator';
import {
  WorkspaceSchemaMigrationException,
  WorkspaceSchemaMigrationExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/exceptions/workspace-schema-migration.exception';

@Injectable()
export class WorkspaceSchemaActionRegistryService implements OnModuleInit {
  private readonly actionHandlers = new Map<
    WorkspaceMigrationActionTypeV2,
    WorkspaceMigrationActionService<WorkspaceMigrationActionTypeV2>
  >();

  constructor(private readonly discoveryService: DiscoveryService) {}

  async onModuleInit() {
    this.discoverAndRegisterHandlers();
  }

  private discoverAndRegisterHandlers(): void {
    const discoveryOptions: DiscoveryOptions = {
      include: [WorkspaceSchemaMigrationRunnerActionHandlersModule],
    };

    const providers = this.discoveryService.getProviders(discoveryOptions);

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

  async executeAction<T extends WorkspaceMigrationActionV2>(
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

  getRegisteredActions(): WorkspaceMigrationActionTypeV2[] {
    return Array.from(this.actionHandlers.keys());
  }
}
