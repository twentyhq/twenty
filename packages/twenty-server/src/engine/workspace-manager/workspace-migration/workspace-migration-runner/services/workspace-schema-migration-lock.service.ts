import { Injectable, Logger } from '@nestjs/common';

import { In, LessThan } from 'typeorm';

import { DeferredWorkspaceMigrationActionEntity } from 'src/engine/metadata-modules/deferred-workspace-migration-action/deferred-workspace-migration-action.entity';
import { WorkspaceSchemaMigrationLockEntity } from 'src/engine/metadata-modules/workspace-schema-migration-lock/workspace-schema-migration-lock.entity';
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
    @InjectWorkspaceScopedRepository(WorkspaceSchemaMigrationLockEntity)
    private readonly workspaceSchemaMigrationLockRepository: WorkspaceScopedRepository<WorkspaceSchemaMigrationLockEntity>,
    @InjectWorkspaceScopedRepository(DeferredWorkspaceMigrationActionEntity)
    private readonly deferredWorkspaceMigrationActionRepository: WorkspaceScopedRepository<DeferredWorkspaceMigrationActionEntity>,
  ) {}

  async acquireOrThrow(workspaceId: string): Promise<Date> {
    await this.throwIfDeferredActionsAreInProgress(workspaceId);

    const lockedAt = await this.takeLockOrThrow(workspaceId);

    try {
      // Deferred actions are only ever persisted by a migration holding the
      // lock, so re-reading them under it closes the window between the first
      // check and the lock.
      await this.throwIfDeferredActionsAreInProgress(workspaceId);
    } catch (error) {
      await this.release({ workspaceId, lockedAt });

      throw error;
    }

    return lockedAt;
  }

  async release({
    workspaceId,
    lockedAt,
  }: {
    workspaceId: string;
    lockedAt: Date;
  }): Promise<void> {
    try {
      // Scoped to the stamp this run took: a migration that overran the
      // takeover timeout must not release the lock of the run that replaced it.
      const { affected } =
        await this.workspaceSchemaMigrationLockRepository.delete(workspaceId, {
          startedAt: lockedAt,
        });

      if (affected !== 1) {
        this.logger.warn(
          `Schema migration lock of workspace ${workspaceId} was taken over by another run, leaving it untouched`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to release the schema migration lock of workspace ${workspaceId}, it will be taken over after ${WORKSPACE_SCHEMA_MIGRATION_LOCK_TAKEOVER_TIMEOUT_MS}ms: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async takeLockOrThrow(workspaceId: string): Promise<Date> {
    const lockedAt = new Date();
    const takeoverBefore = new Date(
      lockedAt.getTime() - WORKSPACE_SCHEMA_MIGRATION_LOCK_TAKEOVER_TIMEOUT_MS,
    );

    const { affected: takenOverCount } =
      await this.workspaceSchemaMigrationLockRepository.update(
        workspaceId,
        { startedAt: LessThan(takeoverBefore) },
        { startedAt: lockedAt },
      );

    if (takenOverCount === 1) {
      this.logger.warn(
        `Took over the schema migration lock of workspace ${workspaceId}, the run holding it started more than ${WORKSPACE_SCHEMA_MIGRATION_LOCK_TAKEOVER_TIMEOUT_MS}ms ago`,
      );

      return lockedAt;
    }

    const { raw: insertedLocks } =
      await this.workspaceSchemaMigrationLockRepository
        .createQueryBuilder()
        .insert()
        .into(WorkspaceSchemaMigrationLockEntity)
        .values({ workspaceId, startedAt: lockedAt })
        .orIgnore()
        .returning('"workspaceId"')
        .execute();

    if (insertedLocks.length !== 1) {
      throw new WorkspaceMigrationRunnerException({
        message: `Another schema migration is already running on workspace ${workspaceId}`,
        code: WorkspaceMigrationRunnerExceptionCode.SCHEMA_MIGRATION_IN_PROGRESS,
      });
    }

    return lockedAt;
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
