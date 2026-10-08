import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { DEFERRED_WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-action-handlers/constants/deferred-workspace-migration-action-handler-metadata-key.constant';
import { type DeferredWorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-action-handlers/interfaces/deferred-workspace-migration-action-handler.interface';
import {
  DeferredWorkspaceMigrationActionException,
  DeferredWorkspaceMigrationActionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/deferred-workspace-migration-action.exception';
import { type DeferredWorkspaceMigrationActionName } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';

@Injectable()
export class DeferredWorkspaceMigrationActionHandlerRegistryService implements OnModuleInit {
  private readonly handlerByName = new Map<
    DeferredWorkspaceMigrationActionName,
    DeferredWorkspaceMigrationActionHandler
  >();

  constructor(private readonly discoveryService: DiscoveryService) {}

  onModuleInit() {
    this.discoveryService
      .getProviders({
        include: [WorkspaceSchemaMigrationRunnerActionHandlersModule],
      })
      .forEach(({ instance, metatype }) => {
        if (!isDefined(instance) || !isDefined(metatype)) {
          return;
        }

        const name: DeferredWorkspaceMigrationActionName | undefined =
          Reflect.getMetadata(
            DEFERRED_WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY,
            metatype,
          );

        if (isDefined(name)) {
          this.handlerByName.set(name, instance);
        }
      });
  }

  getHandler(
    name: DeferredWorkspaceMigrationActionName,
  ): DeferredWorkspaceMigrationActionHandler {
    const handler = this.handlerByName.get(name);

    if (!isDefined(handler)) {
      throw new DeferredWorkspaceMigrationActionException(
        `No deferred workspace migration action handler found for action: ${name}`,
        DeferredWorkspaceMigrationActionExceptionCode.HANDLER_NOT_FOUND,
      );
    }

    return handler;
  }
}
