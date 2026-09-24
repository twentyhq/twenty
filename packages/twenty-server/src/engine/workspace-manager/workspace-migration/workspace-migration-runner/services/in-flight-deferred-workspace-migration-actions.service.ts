import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

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
