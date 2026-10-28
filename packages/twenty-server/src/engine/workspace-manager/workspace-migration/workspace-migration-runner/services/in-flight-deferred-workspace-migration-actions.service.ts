import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { DeferredWorkspaceMigrationActionEntity } from 'src/engine/metadata-modules/deferred-workspace-migration-action/deferred-workspace-migration-action.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { IN_FLIGHT_SCHEMA_AFFECTING_DEFERRED_ACTIONS_POLL_INTERVAL_MS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/in-flight-schema-affecting-deferred-actions-poll-interval-ms.constant';
import { IN_FLIGHT_SCHEMA_AFFECTING_DEFERRED_ACTIONS_WAIT_TIMEOUT_MS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/in-flight-schema-affecting-deferred-actions-wait-timeout-ms.constant';
import { SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTIONS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/schema-affecting-deferred-workspace-migration-actions.constant';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

@Injectable()
export class InFlightDeferredWorkspaceMigrationActionsService {
  constructor(
    @InjectWorkspaceScopedRepository(DeferredWorkspaceMigrationActionEntity)
    private readonly deferredWorkspaceMigrationActionRepository: WorkspaceScopedRepository<DeferredWorkspaceMigrationActionEntity>,
  ) {}

  async throwIfSchemaAffectingActionsAreInProgress(
    workspaceId: string,
  ): Promise<void> {
    // Back-to-back data model changes wait for the worker instead of failing.
    const deadline =
      Date.now() + IN_FLIGHT_SCHEMA_AFFECTING_DEFERRED_ACTIONS_WAIT_TIMEOUT_MS;

    for (;;) {
      const inProgressActionCount =
        await this.countInProgressSchemaAffectingActions(workspaceId);

      if (inProgressActionCount === 0) {
        return;
      }

      if (Date.now() >= deadline) {
        throw new WorkspaceMigrationRunnerException({
          message: `${inProgressActionCount} deferred schema action(s) are still running on workspace ${workspaceId}`,
          code: WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
        });
      }

      await new Promise((resolve) =>
        setTimeout(
          resolve,
          IN_FLIGHT_SCHEMA_AFFECTING_DEFERRED_ACTIONS_POLL_INTERVAL_MS,
        ),
      );
    }
  }

  private countInProgressSchemaAffectingActions(
    workspaceId: string,
  ): Promise<number> {
    return this.deferredWorkspaceMigrationActionRepository.count(workspaceId, {
      where: {
        status: In(['PENDING', 'IN_PROGRESS']),
        name: In([...SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTIONS]),
      },
    });
  }
}
