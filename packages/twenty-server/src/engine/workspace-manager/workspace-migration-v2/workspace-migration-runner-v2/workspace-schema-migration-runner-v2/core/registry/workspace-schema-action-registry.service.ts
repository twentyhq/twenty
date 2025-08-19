import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { type WorkspaceMigrationActionService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/core/interfaces/workspace-migration-action-service.interface';

import {
  type WorkspaceMigrationActionTypeV2,
  type WorkspaceMigrationActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/core/decorators/workspace-migration-action-handler.decorator';
import { type SchemaActionContext } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner-v2/core/types/schema-action-context.type';
import {
  WorkspaceSchemaMigrationException,
  WorkspaceSchemaMigrationExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/exceptions/workspace-schema-migration.exception';

@Injectable()
export class WorkspaceSchemaActionRegistryService {
  private readonly actionHandlers = new Map<
    WorkspaceMigrationActionTypeV2,
    WorkspaceMigrationActionService
  >();

  constructor(private readonly discoveryService: DiscoveryService) {
    this.discoverAndRegisterHandlers();
  }

  private discoverAndRegisterHandlers(): void {
    const providers = this.discoveryService.getProviders();

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
    context: SchemaActionContext<T>,
  ): Promise<void> {
    const handler = this.actionHandlers.get(actionType);

    if (!handler) {
      throw new WorkspaceSchemaMigrationException(
        `No handler found for action: ${actionType}`,
        WorkspaceSchemaMigrationExceptionCode.INVALID_ACTION_TYPE,
      );
    }

    await handler.execute(context);
  }

  getRegisteredActions(): WorkspaceMigrationActionTypeV2[] {
    return Array.from(this.actionHandlers.keys());
  }
}
