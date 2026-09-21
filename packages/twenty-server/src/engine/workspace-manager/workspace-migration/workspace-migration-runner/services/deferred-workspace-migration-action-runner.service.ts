import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { DeferredWorkspaceMigrationActionEntity } from 'src/engine/metadata-modules/deferred-workspace-migration-action/deferred-workspace-migration-action.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { DEFERRED_WORKSPACE_MIGRATION_ACTION_MAX_ATTEMPTS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-migration-action-max-attempts.constant';
import { DEFERRED_WORKSPACE_MIGRATION_ACTION_STATEMENT_TIMEOUT_MS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-migration-action-statement-timeout-ms.constant';
import {
  DeferredWorkspaceMigrationActionException,
  DeferredWorkspaceMigrationActionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/deferred-workspace-migration-action.exception';
import { WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/registry/workspace-migration-runner-action-handler-registry.service';
import { type DeferredWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';

@Injectable()
export class DeferredWorkspaceMigrationActionRunnerService {
  private readonly logger = new Logger(
    DeferredWorkspaceMigrationActionRunnerService.name,
  );

  constructor(
    @InjectWorkspaceScopedRepository(DeferredWorkspaceMigrationActionEntity)
    private readonly deferredWorkspaceMigrationActionRepository: WorkspaceScopedRepository<DeferredWorkspaceMigrationActionEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceMigrationRunnerActionHandlerRegistry: WorkspaceMigrationRunnerActionHandlerRegistryService,
  ) {}

  async executeInProcess({
    deferredActions,
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    deferredActions: DeferredWorkspaceMigrationAction[];
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    try {
      const results = await Promise.allSettled(
        deferredActions.map((deferredAction) =>
          this.workspaceMigrationRunnerActionHandlerRegistry.executeDeferredActionHandler(
            {
              deferredAction,
              workspaceId,
              applicationUniversalIdentifier,
              attempt: 1,
              queryRunner,
            },
          ),
        ),
      );

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          this.logger.warn(
            `Deferred action ${deferredActions[index].actionHandlerKey} failed for workspace ${workspaceId}: ${
              result.reason instanceof Error
                ? result.reason.message
                : String(result.reason)
            }`,
          );
        }
      });
    } finally {
      await queryRunner.release();
    }
  }

  async runPendingActions(workspaceId: string): Promise<void> {
    const pendingActions =
      await this.deferredWorkspaceMigrationActionRepository.find(workspaceId, {
        where: { status: 'PENDING' },
        order: { createdAt: 'ASC' },
      });

    if (pendingActions.length === 0) {
      return;
    }

    const deferredActionDataSource =
      await this.createDeferredActionDataSource();
    const failedActionIds: string[] = [];

    try {
      for (const pendingAction of pendingActions) {
        const hasSucceeded = await this.claimAndExecute({
          pendingAction,
          deferredActionDataSource,
        });

        if (!hasSucceeded) {
          failedActionIds.push(pendingAction.id);
        }
      }
    } finally {
      await deferredActionDataSource.destroy();
    }

    if (failedActionIds.length > 0) {
      throw new DeferredWorkspaceMigrationActionException(
        `${failedActionIds.length} deferred workspace migration action(s) failed for workspace ${workspaceId}: ${failedActionIds.join(', ')}`,
        DeferredWorkspaceMigrationActionExceptionCode.EXECUTION_FAILED,
      );
    }
  }

  private async claimAndExecute({
    pendingAction,
    deferredActionDataSource,
  }: {
    pendingAction: DeferredWorkspaceMigrationActionEntity;
    deferredActionDataSource: DataSource;
  }): Promise<boolean> {
    const { id, workspaceId } = pendingAction;
    const attempt = pendingAction.attempts + 1;

    const claimResult =
      await this.deferredWorkspaceMigrationActionRepository.update(
        workspaceId,
        { id, status: 'PENDING' },
        { status: 'IN_PROGRESS', attempts: attempt, startedAt: new Date() },
      );

    if (claimResult.affected !== 1) {
      return true;
    }

    const queryRunner = deferredActionDataSource.createQueryRunner();
    const executionStart = performance.now();

    try {
      await queryRunner.connect();

      await this.workspaceMigrationRunnerActionHandlerRegistry.executeDeferredActionHandler(
        {
          deferredAction: {
            actionHandlerKey: pendingAction.actionHandlerKey,
            payload: pendingAction.payload,
          } as DeferredWorkspaceMigrationAction,
          workspaceId,
          applicationUniversalIdentifier:
            pendingAction.applicationUniversalIdentifier,
          attempt,
          queryRunner,
        },
      );

      await this.deferredWorkspaceMigrationActionRepository.delete(
        workspaceId,
        { id },
      );

      this.logger.log(
        `Deferred action ${pendingAction.actionHandlerKey} ${id} completed for workspace ${workspaceId} in ${(performance.now() - executionStart).toFixed(0)}ms`,
      );

      return true;
    } catch (error) {
      await this.deferredWorkspaceMigrationActionRepository.update(
        workspaceId,
        { id },
        {
          status:
            attempt >= DEFERRED_WORKSPACE_MIGRATION_ACTION_MAX_ATTEMPTS
              ? 'FAILED'
              : 'PENDING',
          lastError: error instanceof Error ? error.message : String(error),
        },
      );

      this.logger.error(
        `Deferred action ${pendingAction.actionHandlerKey} ${id} failed for workspace ${workspaceId} (attempt ${attempt}/${DEFERRED_WORKSPACE_MIGRATION_ACTION_MAX_ATTEMPTS})`,
        error instanceof Error ? error.stack : undefined,
      );

      return false;
    } finally {
      await queryRunner.release();
    }
  }

  private async createDeferredActionDataSource(): Promise<DataSource> {
    const coreDataSourceOptions = this.coreDataSource.options;

    if (coreDataSourceOptions.type !== 'postgres') {
      throw new DeferredWorkspaceMigrationActionException(
        `Deferred workspace migration actions require a postgres datasource, got ${coreDataSourceOptions.type}`,
        DeferredWorkspaceMigrationActionExceptionCode.EXECUTION_FAILED,
      );
    }

    const deferredActionDataSource = new DataSource({
      ...coreDataSourceOptions,
      entities: [],
      migrations: [],
      subscribers: [],
      poolSize: 1,
      extra: {
        ...coreDataSourceOptions.extra,
        query_timeout: undefined,
        statement_timeout:
          DEFERRED_WORKSPACE_MIGRATION_ACTION_STATEMENT_TIMEOUT_MS,
      },
    });

    return deferredActionDataSource.initialize();
  }
}
