import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isDefined } from 'twenty-shared/utils';

import { BaseWorkspaceMigrationRunnerActionHandlerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import {
  buildActionHandlerKey,
  type WorkspaceMigrationActionHandlerKey,
  type WorkspaceMigrationActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WorkspaceSchemaMigrationRunnerActionHandlersModule } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/action-handlers/workspace-schema-migration-runner-action-handlers.module';
import { WORKSPACE_MIGRATION_ACTION_HANDLER_METADATA_KEY } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/constants/workspace-migration-action-handler-metadata-key.constant';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/exceptions/workspace-migration-runner.exception';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

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

  async executeActionHandler<T extends WorkspaceMigrationActionV2>({
    action,
    context,
    rollback,
  }: {
    action: T;
    context: WorkspaceMigrationActionRunnerArgs<T>;
    rollback?: boolean;
  }): Promise<Partial<AllFlatEntityMaps>> {
    const actionHandlerKey = buildActionHandlerKey(
      action.type,
      action.metadataName,
    );
    const handler = this.actionHandlers.get(actionHandlerKey);

    if (!handler) {
      throw new WorkspaceMigrationRunnerException(
        `No migration runner action handler found for action: ${actionHandlerKey}`,
        WorkspaceMigrationRunnerExceptionCode.INVALID_ACTION_TYPE,
      );
    }

    if (isDefined(rollback) && rollback) {
      await handler.rollback(context);

      return {};
    }

    return await handler.execute(context);
  }
}
