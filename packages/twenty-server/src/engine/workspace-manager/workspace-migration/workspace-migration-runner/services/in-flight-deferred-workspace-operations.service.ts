import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { DeferredWorkspaceOperationEntity } from 'src/engine/metadata-modules/deferred-workspace-operation/deferred-workspace-operation.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { SCHEMA_AFFECTING_DEFERRED_WORKSPACE_OPERATIONS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/schema-affecting-deferred-workspace-operations.constant';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-runner.exception';

@Injectable()
export class InFlightDeferredWorkspaceOperationsService {
  constructor(
    @InjectWorkspaceScopedRepository(DeferredWorkspaceOperationEntity)
    private readonly deferredWorkspaceOperationRepository: WorkspaceScopedRepository<DeferredWorkspaceOperationEntity>,
  ) {}

  async throwIfSchemaAffectingOperationsAreInProgress(
    workspaceId: string,
  ): Promise<void> {
    const inProgressOperationCount =
      await this.deferredWorkspaceOperationRepository.count(workspaceId, {
        where: {
          status: In(['PENDING', 'IN_PROGRESS']),
          name: In([...SCHEMA_AFFECTING_DEFERRED_WORKSPACE_OPERATIONS]),
        },
      });

    if (inProgressOperationCount > 0) {
      throw new WorkspaceMigrationRunnerException({
        message: `${inProgressOperationCount} deferred schema operation(s) are still running on workspace ${workspaceId}`,
        code: WorkspaceMigrationRunnerExceptionCode.DEFERRED_WORKSPACE_MIGRATION_ACTIONS_IN_PROGRESS,
      });
    }
  }
}
