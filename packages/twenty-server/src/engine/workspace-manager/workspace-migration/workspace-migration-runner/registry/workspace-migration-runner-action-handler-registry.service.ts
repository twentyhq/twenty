import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { type AllMetadataName } from 'twenty-shared/metadata';
import { type QueryRunner } from 'typeorm';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

import { BaseWorkspaceMigrationRunnerActionHandlerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import {
  buildActionHandlerKey,
  type AllUniversalWorkspaceMigrationAction,
  type WorkspaceMigrationActionHandlerKey,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/workspace-migration-action-handler-metadata-key.constant';
import {
  WorkspaceMigrationActionExecutionException,
  WorkspaceMigrationActionExecutionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-action-execution.exception';
import {
  DeferredWorkspaceMigrationActionException,
  DeferredWorkspaceMigrationActionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/deferred-workspace-migration-action.exception';
import { DEFERRED_WORKSPACE_MIGRATION_ACTION_HANDLER_KEY_BY_NAME } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-migration-action-handler-key-by-name.constant';
import {
  type DeferredWorkspaceMigrationActionName,
  type PersistedDeferredWorkspaceMigrationAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class WorkspaceMigrationRunnerActionHandlerRegistryService implements OnModuleInit {
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

  private getActionHandler<T extends AllUniversalWorkspaceMigrationAction>(
    action: T,
  ) {
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

  async executeActionHandler<T extends AllUniversalWorkspaceMigrationAction>({
    action,
    context,
  }: {
    action: T;
    context: WorkspaceMigrationActionRunnerArgs<T>;
  }) {
    const handler = this.getActionHandler(action);

    return await handler.execute(context);
  }

  async executeActionRollbackHandler<
    T extends AllUniversalWorkspaceMigrationAction,
  >({
    action,
    context,
  }: {
    action: T;
    context: Omit<WorkspaceMigrationActionRunnerArgs<T>, 'queryRunner'>;
  }) {
    const handler = this.getActionHandler(action);

    await handler.rollback(context);
  }

  getDeferredActionMetadataName(
    name: DeferredWorkspaceMigrationActionName,
  ): AllMetadataName {
    return this.getDeferredActionHandler(name).metadataName;
  }

  async executeDeferredActionHandler({
    deferredAction,
    workspaceId,
    applicationUniversalIdentifier,
    allFlatEntityMaps,
    attempt,
    queryRunner,
  }: {
    deferredAction: PersistedDeferredWorkspaceMigrationAction;
    workspaceId: string;
    applicationUniversalIdentifier: string;
    allFlatEntityMaps: AllFlatEntityMaps;
    attempt: number;
    queryRunner: QueryRunner;
  }): Promise<void> {
    await this.getDeferredActionHandler(
      deferredAction.name,
    ).executeDeferredAction({
      workspaceId,
      applicationUniversalIdentifier,
      payload: deferredAction.payload,
      allFlatEntityMaps,
      attempt,
      queryRunner,
    });
  }

  private getDeferredActionHandler(name: DeferredWorkspaceMigrationActionName) {
    const actionHandlerKey =
      DEFERRED_WORKSPACE_MIGRATION_ACTION_HANDLER_KEY_BY_NAME[name];
    const handler = this.actionHandlers.get(actionHandlerKey);

    if (!handler) {
      throw new DeferredWorkspaceMigrationActionException(
        `No migration runner action handler found for deferred action: ${name}`,
        DeferredWorkspaceMigrationActionExceptionCode.HANDLER_NOT_FOUND,
      );
    }

    return handler;
  }
}
