import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { BaseWorkspaceMigrationRunnerActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import {
  buildActionHandlerKey,
  type WorkspaceMigrationAction,
  type WorkspaceMigrationActionHandlerKey,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/workspace-migration-action-handler-metadata-key.constant';
import {
  WorkspaceMigrationActionExecutionException,
  WorkspaceMigrationActionExecutionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-action-execution.exception';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class WorkspaceMigrationRunnerActionHandlerRegistryService
  implements OnModuleInit
{
  private readonly actionHandlers = new Map<
    WorkspaceMigrationActionHandlerKey,
    InstanceType<typeof BaseWorkspaceMigrationRunnerActionHandlerService>
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

      const actionHandlerKey: WorkspaceMigrationActionHandlerKey | undefined =
        Reflect.getMetadata(
          WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY,
          metatype,
        );

      if (actionHandlerKey && instance.execute) {
        this.actionHandlers.set(actionHandlerKey, instance);
      }
    });
  }

  private getActionHandler<T extends WorkspaceMigrationAction>(action: T) {
    const actionHandlerKey = buildActionHandlerKey(
      action.type,
      action.metadataName,
    );
    const handler = this.actionHandlers.get(actionHandlerKey);

    if (!handler) {
      throw new WorkspaceMigrationActionExecutionException({
        message: `No migration runner action handler found for action: ${actionHandlerKey}`,
        code: WorkspaceMigrationActionExecutionExceptionCode.INVALID_ACTION_TYPE,
      });
    }

    return handler;
  }

  async executeActionHandler<T extends WorkspaceMigrationAction>({
    action,
    context,
  }: {
    action: T;
    context: WorkspaceMigrationActionRunnerArgs<T>;
  }) {
    const handler = this.getActionHandler(action);

    return await handler.execute(context);
  }

  async executeActionRollbackHandler<T extends WorkspaceMigrationAction>({
    action,
    context,
  }: {
    action: T;
    context: Omit<WorkspaceMigrationActionRunnerArgs<T>, 'queryRunner'>;
  }) {
    const handler = this.getActionHandler(action);

    await handler.rollback(context);
  }
}
