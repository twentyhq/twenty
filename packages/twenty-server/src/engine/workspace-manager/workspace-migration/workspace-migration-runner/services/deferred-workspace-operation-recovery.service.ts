import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { LessThan, MoreThanOrEqual } from 'typeorm';

import { DeferredWorkspaceOperationEntity } from 'src/engine/metadata-modules/deferred-workspace-operation/deferred-workspace-operation.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { DEFERRED_WORKSPACE_OPERATION_MAX_ATTEMPTS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-operation-max-attempts.constant';
import { DEFERRED_WORKSPACE_OPERATION_STALE_THRESHOLD_MS } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/constants/deferred-workspace-operation-stale-threshold-ms.constant';
import { DeferredWorkspaceOperationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/deferred-workspace-operation-runner.service';
import { type DeferredWorkspaceOperationStatus } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-status.type';

@Injectable()
export class DeferredWorkspaceOperationRecoveryService {
  constructor(
    @InjectWorkspaceScopedRepository(DeferredWorkspaceOperationEntity)
    private readonly deferredWorkspaceOperationRepository: WorkspaceScopedRepository<DeferredWorkspaceOperationEntity>,
    private readonly deferredWorkspaceOperationRunnerService: DeferredWorkspaceOperationRunnerService,
  ) {}

  async resetStaleInProgressOperations(): Promise<number> {
    const staleBefore = new Date(
      Date.now() - DEFERRED_WORKSPACE_OPERATION_STALE_THRESHOLD_MS,
    );
    const lastError = 'Worker stopped while the operation was in progress';

    const failedResult = await this.deferredWorkspaceOperationRepository
      .createQueryBuilder()
      .update()
      .set({ status: 'FAILED', lastError })
      .where({
        status: 'IN_PROGRESS',
        startedAt: LessThan(staleBefore),
        attempts: MoreThanOrEqual(DEFERRED_WORKSPACE_OPERATION_MAX_ATTEMPTS),
      })
      .execute();

    const pendingResult = await this.deferredWorkspaceOperationRepository
      .createQueryBuilder()
      .update()
      .set({ status: 'PENDING', lastError })
      .where({
        status: 'IN_PROGRESS',
        startedAt: LessThan(staleBefore),
      })
      .execute();

    return (failedResult.affected ?? 0) + (pendingResult.affected ?? 0);
  }

  async enqueueWorkspacesWithPendingOperations(): Promise<number> {
    const workspaceIds = await this.findWorkspaceIdsByStatus('PENDING');

    for (const workspaceId of workspaceIds) {
      await this.deferredWorkspaceOperationRunnerService.enqueue(workspaceId);
    }

    return workspaceIds.length;
  }

  async retryFailedOperations(workspaceId?: string): Promise<number> {
    const workspaceIds = isDefined(workspaceId)
      ? [workspaceId]
      : await this.findWorkspaceIdsByStatus('FAILED');

    let retriedOperationCount = 0;

    for (const workspaceIdToRetry of workspaceIds) {
      const { affected } =
        await this.deferredWorkspaceOperationRepository.update(
          workspaceIdToRetry,
          { status: 'FAILED' },
          { status: 'PENDING', attempts: 0, startedAt: null },
        );

      if ((affected ?? 0) > 0) {
        retriedOperationCount += affected ?? 0;
        await this.deferredWorkspaceOperationRunnerService.enqueue(
          workspaceIdToRetry,
        );
      }
    }

    return retriedOperationCount;
  }

  private async findWorkspaceIdsByStatus(
    status: DeferredWorkspaceOperationStatus,
  ): Promise<string[]> {
    const rows = await this.deferredWorkspaceOperationRepository
      .createQueryBuilder('deferredWorkspaceOperation')
      .select('deferredWorkspaceOperation.workspaceId', 'workspaceId')
      .distinct(true)
      .where('deferredWorkspaceOperation.status = :status', { status })
      .getRawMany<{ workspaceId: string }>();

    return rows.map(({ workspaceId }) => workspaceId);
  }
}
