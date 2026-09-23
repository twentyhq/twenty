import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { DeferredWorkspaceMigrationActionEntity } from 'src/engine/metadata-modules/deferred-workspace-migration-action/deferred-workspace-migration-action.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { DEFERRABLE_WORKSPACE_MIGRATION_ACTIONS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferrable-workspace-migration-actions.constant';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';
import { WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/registry/workspace-migration-runner-action-handler-registry.service';
import { isSchemaAffectingMetadataName } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/is-schema-affecting-metadata-name.util';

@Injectable()
export class SchemaAffectingDeferredActionsGuardService {
  constructor(
    @InjectWorkspaceScopedRepository(DeferredWorkspaceMigrationActionEntity)
    private readonly deferredWorkspaceMigrationActionRepository: WorkspaceScopedRepository<DeferredWorkspaceMigrationActionEntity>,
    private readonly workspaceMigrationRunnerActionHandlerRegistry: WorkspaceMigrationRunnerActionHandlerRegistryService,
  ) {}

  async throwIfDeferredActionsAreInProgress(
    workspaceId: string,
  ): Promise<void> {
    const inProgressActionCount =
      await this.deferredWorkspaceMigrationActionRepository.count(workspaceId, {
        where: {
          status: In(['PENDING', 'IN_PROGRESS']),
          actionHandlerKey: In(this.getSchemaAffectingActionHandlerKeys()),
        },
      });

    if (inProgressActionCount > 0) {
      throw new WorkspaceMigrationRunnerException({
        message: `${inProgressActionCount} deferred schema action(s) are still running on workspace ${workspaceId}`,
        code: WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
      });
    }
  }

  private getSchemaAffectingActionHandlerKeys(): string[] {
    return DEFERRABLE_WORKSPACE_MIGRATION_ACTIONS.filter((actionHandlerKey) =>
      isSchemaAffectingMetadataName(
        this.workspaceMigrationRunnerActionHandlerRegistry.getDeferredActionMetadataName(
          actionHandlerKey,
        ),
      ),
    );
  }
}
