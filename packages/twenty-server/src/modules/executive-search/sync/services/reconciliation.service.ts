import { Injectable, Logger } from '@nestjs/common';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { ExternalSyncReconciliationWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-reconciliation.workspace-entity';

export const RECONCILIATION_STATUS = {
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

/**
 * Reconciliation service.
 *
 * Tracks reconciliation runs that compare Twenty records against
 * external system records. Findings are stored as structured JSON.
 */
@Injectable()
export class ExecutiveSearchReconciliationService {
  private readonly logger = new Logger(
    ExecutiveSearchReconciliationService.name,
  );

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  /**
   * Start a new reconciliation run.
   */
  async startRun(
    workspaceId: string,
    externalSystemName: string,
    entityName: string,
  ): Promise<ExternalSyncReconciliationWorkspaceEntity> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncReconciliationWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      const entity = repository.create({
        workspaceId,
        externalSystemName,
        entityName,
        startedAt: new Date().toISOString(),
        completedAt: null,
        status: RECONCILIATION_STATUS.RUNNING,
        totalCompared: 0,
        matched: 0,
        onlyInTwenty: 0,
        onlyInExternal: 0,
        differenceCount: 0,
        findings: null,
      });

      return repository.save(entity);
    }, authContext);
  }

  /**
   * Complete a reconciliation run with results.
   */
  async completeRun(
    workspaceId: string,
    runId: string,
    results: {
      totalCompared: number;
      matched: number;
      onlyInTwenty: number;
      onlyInExternal: number;
      differenceCount: number;
      findings: Record<string, unknown> | null;
    },
  ): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncReconciliationWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      await repository.update(runId, {
        status: RECONCILIATION_STATUS.COMPLETED,
        completedAt: new Date().toISOString(),
        totalCompared: results.totalCompared,
        matched: results.matched,
        onlyInTwenty: results.onlyInTwenty,
        onlyInExternal: results.onlyInExternal,
        differenceCount: results.differenceCount,
        findings: results.findings,
      } as any);
    }, authContext);
  }

  /**
   * List recent reconciliation runs.
   */
  async listRecent(
    workspaceId: string,
    limit = 20,
  ): Promise<ExternalSyncReconciliationWorkspaceEntity[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        ExternalSyncReconciliationWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      return repository.find({
        order: { startedAt: 'DESC' },
        take: limit,
      });
    }, authContext);
  }
}
