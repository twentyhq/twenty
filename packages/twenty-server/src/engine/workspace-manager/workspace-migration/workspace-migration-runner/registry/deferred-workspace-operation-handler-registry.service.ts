import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { DEFERRED_WORKSPACE_OPERATION_HANDLER_METADATA_KEY } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/constants/deferred-workspace-operation-handler-metadata-key.constant';
import { type DeferredWorkspaceOperationHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/interfaces/deferred-workspace-operation-handler.interface';
import {
  DeferredWorkspaceOperationException,
  DeferredWorkspaceOperationExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/deferred-workspace-operation.exception';
import { type DeferredWorkspaceOperationName } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

@Injectable()
export class DeferredWorkspaceOperationHandlerRegistryService implements OnModuleInit {
  private readonly handlerByName = new Map<
    DeferredWorkspaceOperationName,
    DeferredWorkspaceOperationHandler
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

        const name: DeferredWorkspaceOperationName | undefined =
          Reflect.getMetadata(
            DEFERRED_WORKSPACE_OPERATION_HANDLER_METADATA_KEY,
            metatype,
          );

        if (isDefined(name)) {
          this.handlerByName.set(name, instance);
        }
      });
  }

  getHandler(
    name: DeferredWorkspaceOperationName,
  ): DeferredWorkspaceOperationHandler {
    const handler = this.handlerByName.get(name);

    if (!isDefined(handler)) {
      throw new DeferredWorkspaceOperationException(
        `No deferred workspace operation handler found for operation: ${name}`,
        DeferredWorkspaceOperationExceptionCode.HANDLER_NOT_FOUND,
      );
    }

    return handler;
  }
}
