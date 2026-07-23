import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import {
  type BaseDatabaseEventTriggerSettings,
  type CronTriggerSettings,
} from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';

type DriftCounts = Record<string, number>;

// Detect drift between the workspace source-of-truth records and their core
// mirror. The dual-write is best-effort (async, not transactional), so core can
// silently fall out of sync; this quantifies that per workspace as metrics.
@Injectable()
export class WorkflowCoreConsistencyService {
  private readonly logger = new Logger(WorkflowCoreConsistencyService.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly metricsService: MetricsService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  async runConsistencyCheck(): Promise<void> {
    // Only workspaces that actually use workflows; the soft-ref makes this a
    // cheap central lookup that skips the vast majority of workspaces.
    const workspaces: Array<{ workspaceId: string }> =
      await this.coreDataSource.query(
        `SELECT DISTINCT "workspaceId" FROM core."workflow"`,
      );

    for (const { workspaceId } of workspaces) {
      try {
        await this.checkWorkspace(workspaceId);
      } catch (error) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: workspaceId },
        });
      }
    }
  }

  private async checkWorkspace(workspaceId: string): Promise<void> {
    const [workspace] = await this.coreDataSource.query(
      `SELECT "databaseSchema" FROM core."workspace" WHERE id = $1`,
      [workspaceId],
    );

    if (!isDefined(workspace?.databaseSchema)) {
      return;
    }

    const schema: string = workspace.databaseSchema;

    await this.checkWorkflowSync(workspaceId, schema);
    await this.checkWorkflowVersionSync(workspaceId, schema);
    await this.checkAutomatedTriggerSync(workspaceId, schema);
  }

  private async checkWorkflowSync(
    workspaceId: string,
    schema: string,
  ): Promise<void> {
    const [counts] = await this.coreDataSource.query(
      `SELECT
         count(*) FILTER (WHERE wf."coreWorkflowId" IS NULL)::int AS unlinked,
         count(*) FILTER (WHERE wf."coreWorkflowId" IS NOT NULL AND c.id IS NULL)::int AS "missingCore",
         count(*) FILTER (WHERE c.id IS NOT NULL AND (
           wf.name IS DISTINCT FROM c.name
           OR NULLIF(wf."lastPublishedVersionId", '') IS DISTINCT FROM c."lastPublishedVersionId"::text
         ))::int AS "fieldMismatch"
       FROM "${schema}"."workflow" wf
       LEFT JOIN core."workflow" c
         ON c.id = wf."coreWorkflowId" AND c."workspaceId" = $1
       WHERE wf."deletedAt" IS NULL`,
      [workspaceId],
    );

    const [{ orphanCore }] = await this.coreDataSource.query(
      `SELECT count(*)::int AS "orphanCore"
       FROM core."workflow" c
       WHERE c."workspaceId" = $1
         AND NOT EXISTS (
           SELECT 1 FROM "${schema}"."workflow" wf WHERE wf."coreWorkflowId" = c.id
         )`,
      [workspaceId],
    );

    this.emitDrift(
      MetricsKeys.WorkflowCoreConsistencyWorkflowDrift,
      workspaceId,
      'workflow',
      {
        unlinked: counts.unlinked,
        missingCore: counts.missingCore,
        fieldMismatch: counts.fieldMismatch,
        orphanCore,
      },
    );
  }

  private async checkWorkflowVersionSync(
    workspaceId: string,
    schema: string,
  ): Promise<void> {
    const [counts] = await this.coreDataSource.query(
      `SELECT
         count(*) FILTER (WHERE wf."coreWorkflowVersionId" IS NULL)::int AS unlinked,
         count(*) FILTER (WHERE wf."coreWorkflowVersionId" IS NOT NULL AND c.id IS NULL)::int AS "missingCore",
         count(*) FILTER (WHERE c.id IS NOT NULL AND (
           c.status::text IS DISTINCT FROM wf.status::text
           OR c."workflowId" IS DISTINCT FROM wf."workflowId"
           OR c.steps IS DISTINCT FROM wf.steps
           OR c.triggers IS DISTINCT FROM (
             CASE WHEN wf.trigger IS NULL THEN NULL ELSE jsonb_build_array(wf.trigger) END
           )
         ))::int AS "fieldMismatch"
       FROM "${schema}"."workflowVersion" wf
       LEFT JOIN core."workflowVersion" c
         ON c.id = wf."coreWorkflowVersionId" AND c."workspaceId" = $1
       WHERE wf."deletedAt" IS NULL`,
      [workspaceId],
    );

    const [{ orphanCore }] = await this.coreDataSource.query(
      `SELECT count(*)::int AS "orphanCore"
       FROM core."workflowVersion" c
       WHERE c."workspaceId" = $1
         AND NOT EXISTS (
           SELECT 1 FROM "${schema}"."workflowVersion" wf WHERE wf."coreWorkflowVersionId" = c.id
         )`,
      [workspaceId],
    );

    this.emitDrift(
      MetricsKeys.WorkflowCoreConsistencyVersionDrift,
      workspaceId,
      'workflowVersion',
      {
        unlinked: counts.unlinked,
        missingCore: counts.missingCore,
        fieldMismatch: counts.fieldMismatch,
        orphanCore,
      },
    );
  }

  private async checkAutomatedTriggerSync(
    workspaceId: string,
    schema: string,
  ): Promise<void> {
    const { workflowAutomatedTriggerMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'workflowAutomatedTriggerMaps',
      ]);
    const cacheByWorkflowId = workflowAutomatedTriggerMaps.byWorkflowId;

    const tableRows: Array<{
      workflowId: string;
      type: AutomatedTriggerType;
      settings: BaseDatabaseEventTriggerSettings | CronTriggerSettings | null;
    }> = await this.coreDataSource.query(
      `SELECT "workflowId", type, settings FROM "${schema}"."workflowAutomatedTrigger"`,
    );

    const tableByWorkflowId = new Map(
      tableRows.map((row) => [row.workflowId, row]),
    );

    let inTableNotCache = 0;
    let inCacheNotTable = 0;
    let mismatch = 0;

    for (const [workflowId, row] of tableByWorkflowId) {
      const cached = cacheByWorkflowId[workflowId];

      if (!isDefined(cached)) {
        inTableNotCache++;
        continue;
      }

      if (
        cached.type !== row.type ||
        this.triggerIdentity(row.type, row.settings) !==
          this.triggerIdentity(cached.type, cached.settings)
      ) {
        mismatch++;
      }
    }

    for (const workflowId of Object.keys(cacheByWorkflowId)) {
      if (!tableByWorkflowId.has(workflowId)) {
        inCacheNotTable++;
      }
    }

    this.emitDrift(
      MetricsKeys.WorkflowCoreConsistencyAutomatedTriggerDrift,
      workspaceId,
      'automatedTrigger',
      { inTableNotCache, inCacheNotTable, mismatch },
    );
  }

  private triggerIdentity(
    type: AutomatedTriggerType,
    settings: BaseDatabaseEventTriggerSettings | CronTriggerSettings | null,
  ): string {
    if (type === AutomatedTriggerType.CRON) {
      return (settings as CronTriggerSettings | null)?.pattern ?? '';
    }

    if (type === AutomatedTriggerType.DATABASE_EVENT) {
      return (
        (settings as BaseDatabaseEventTriggerSettings | null)?.eventName ?? ''
      );
    }

    return '';
  }

  private emitDrift(
    key: MetricsKeys,
    workspaceId: string,
    entity: string,
    counts: DriftCounts,
  ): void {
    for (const [driftType, count] of Object.entries(counts)) {
      if (count > 0) {
        this.metricsService.incrementCounterBy({
          key,
          amount: count,
          attributes: { driftType },
        });
        this.logger.warn(
          `Workflow core consistency drift: workspace=${workspaceId} entity=${entity} ${driftType}=${count}`,
        );
      }
    }
  }
}
