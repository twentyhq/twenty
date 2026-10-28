import { Injectable } from '@nestjs/common';

import { isObject } from '@sniptt/guards';
import { In } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';

import { DeferredWorkspaceMigrationActionEntity } from 'src/engine/metadata-modules/deferred-workspace-migration-action/deferred-workspace-migration-action.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
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
    const inProgressActionCount =
      await this.countInProgressSchemaAffectingActions(workspaceId);

    if (inProgressActionCount > 0) {
      throw new WorkspaceMigrationRunnerException({
        message: `${inProgressActionCount} deferred schema action(s) are still running on workspace ${workspaceId}`,
        code: WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
      });
    }
  }

  private async countInProgressSchemaAffectingActions(
    workspaceId: string,
  ): Promise<number> {
    try {
      return await this.deferredWorkspaceMigrationActionRepository.count(
        workspaceId,
        {
          where: {
            status: In(['PENDING', 'IN_PROGRESS']),
            name: In([
              ...SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTIONS,
            ]),
          },
        },
      );
    } catch (error) {
      // Upgrades from before 2.42 run older workspace commands before the table exists.
      if (
        isObject(error) &&
        'code' in error &&
        error.code === POSTGRESQL_ERROR_CODES.UNDEFINED_TABLE
      ) {
        return 0;
      }

      throw error;
    }
  }
}
