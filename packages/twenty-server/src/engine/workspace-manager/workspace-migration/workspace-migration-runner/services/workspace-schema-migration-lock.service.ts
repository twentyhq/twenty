import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DeferredWorkspaceMigrationActionEntity } from 'src/engine/metadata-modules/deferred-workspace-migration-action/deferred-workspace-migration-action.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTIONS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/schema-affecting-deferred-workspace-migration-actions.constant';
import { WORKSPACE_SCHEMA_MIGRATION_LOCK_TAKEOVER_TIMEOUT_MS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/workspace-schema-migration-lock-takeover-timeout-ms.constant';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

@Injectable()
export class WorkspaceSchemaMigrationLockService {
  private readonly logger = new Logger(
    WorkspaceSchemaMigrationLockService.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectWorkspaceScopedRepository(DeferredWorkspaceMigrationActionEntity)
    private readonly deferredWorkspaceMigrationActionRepository: WorkspaceScopedRepository<DeferredWorkspaceMigrationActionEntity>,
  ) {}

  async acquireOrThrow(workspaceId: string): Promise<void> {
    await this.throwIfDeferredActionsAreInProgress(workspaceId);

    const takeoverBefore = new Date(
      Date.now() - WORKSPACE_SCHEMA_MIGRATION_LOCK_TAKEOVER_TIMEOUT_MS,
    );

    const { affected } = await this.workspaceRepository
      .createQueryBuilder()
      .update()
      .set({
        schemaMigrationStatus: 'MIGRATING',
        schemaMigrationStartedAt: new Date(),
      })
      .where('id = :workspaceId', { workspaceId })
      .andWhere(
        '("schemaMigrationStatus" = :idle OR "schemaMigrationStartedAt" < :takeoverBefore)',
        { idle: 'IDLE', takeoverBefore },
      )
      .execute();

    if (affected !== 1) {
      throw new WorkspaceMigrationRunnerException({
        message: `Another schema migration is already running on workspace ${workspaceId}`,
        code: WorkspaceMigrationRunnerExceptionCode.SCHEMA_MIGRATION_IN_PROGRESS,
      });
    }
  }

  async release(workspaceId: string): Promise<void> {
    try {
      await this.workspaceRepository.update(
        { id: workspaceId },
        { schemaMigrationStatus: 'IDLE', schemaMigrationStartedAt: null },
      );
    } catch (error) {
      this.logger.error(
        `Failed to release the schema migration lock of workspace ${workspaceId}, it will be taken over after ${WORKSPACE_SCHEMA_MIGRATION_LOCK_TAKEOVER_TIMEOUT_MS}ms: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async throwIfDeferredActionsAreInProgress(
    workspaceId: string,
  ): Promise<void> {
    const inProgressActionCount =
      await this.deferredWorkspaceMigrationActionRepository.count(workspaceId, {
        where: {
          status: In(['PENDING', 'IN_PROGRESS']),
          actionHandlerKey: In([
            ...SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTIONS,
          ]),
        },
      });

    if (inProgressActionCount > 0) {
      throw new WorkspaceMigrationRunnerException({
        message: `${inProgressActionCount} deferred schema action(s) are still running on workspace ${workspaceId}`,
        code: WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
      });
    }
  }
}
