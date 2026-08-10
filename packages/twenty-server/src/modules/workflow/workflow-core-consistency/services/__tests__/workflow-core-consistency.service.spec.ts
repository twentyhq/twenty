import { type DataSource, QueryFailedError } from 'typeorm';

import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { WorkflowCoreConsistencyService } from 'src/modules/workflow/workflow-core-consistency/services/workflow-core-consistency.service';

const workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const schema = 'workspace_test';

type Counts = { unlinked: number; missingCore: number; fieldMismatch: number };

describe('WorkflowCoreConsistencyService', () => {
  let service: WorkflowCoreConsistencyService;
  let coreDataSource: { query: jest.Mock };
  let workspaceCacheService: { getOrRecompute: jest.Mock };
  let metricsService: { incrementCounterBy: jest.Mock };
  let exceptionHandlerService: { captureExceptions: jest.Mock };

  let shouldCheck: boolean;
  let workflowCounts: Counts;
  let workflowOrphan: number;
  let versionCounts: Counts;
  let versionOrphan: number;
  let triggerRows: Array<{
    workflowId: string;
    type: string;
    settings: unknown;
  }>;
  let cacheByWorkflowId: Record<string, unknown>;

  const zero = (): Counts => ({
    unlinked: 0,
    missingCore: 0,
    fieldMismatch: 0,
  });

  beforeEach(() => {
    shouldCheck = true;
    workflowCounts = zero();
    workflowOrphan = 0;
    versionCounts = zero();
    versionOrphan = 0;
    triggerRows = [];
    cacheByWorkflowId = {};

    coreDataSource = {
      query: jest.fn().mockImplementation((sql: string) => {
        if (sql.includes('FROM core."workspace"')) {
          return Promise.resolve([{ workspaceId, databaseSchema: schema }]);
        }
        if (sql.includes('AS "shouldCheck"')) {
          return Promise.resolve([{ shouldCheck }]);
        }
        if (sql.includes('AS "orphanCore"')) {
          return Promise.resolve([
            {
              orphanCore: sql.includes('workflowVersion')
                ? versionOrphan
                : workflowOrphan,
            },
          ]);
        }
        if (sql.includes('AS unlinked')) {
          return Promise.resolve([
            sql.includes('workflowVersion') ? versionCounts : workflowCounts,
          ]);
        }
        if (sql.includes('workflowAutomatedTrigger')) {
          return Promise.resolve(triggerRows);
        }

        return Promise.resolve([]);
      }),
    };
    workspaceCacheService = {
      getOrRecompute: jest.fn().mockImplementation(() =>
        Promise.resolve({
          workflowAutomatedTriggerMaps: { byWorkflowId: cacheByWorkflowId },
        }),
      ),
    };
    metricsService = { incrementCounterBy: jest.fn() };
    exceptionHandlerService = { captureExceptions: jest.fn() };

    service = new WorkflowCoreConsistencyService(
      coreDataSource as unknown as DataSource,
      workspaceCacheService as unknown as WorkspaceCacheService,
      metricsService as unknown as MetricsService,
      exceptionHandlerService as unknown as ExceptionHandlerService,
    );

    jest.spyOn(service['logger'], 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('emits nothing for a fully consistent workspace', async () => {
    await service.runConsistencyCheck();

    expect(metricsService.incrementCounterBy).not.toHaveBeenCalled();
    expect(exceptionHandlerService.captureExceptions).not.toHaveBeenCalled();
  });

  it('emits a drift count per dimension for workflow drift', async () => {
    workflowCounts = { unlinked: 2, missingCore: 0, fieldMismatch: 1 };

    await service.runConsistencyCheck();

    expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
      key: MetricsKeys.WorkflowCoreConsistencyWorkflowDrift,
      amount: 2,
      attributes: { driftType: 'unlinked' },
    });
    expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
      key: MetricsKeys.WorkflowCoreConsistencyWorkflowDrift,
      amount: 1,
      attributes: { driftType: 'fieldMismatch' },
    });
  });

  it('emits version drift including orphan core rows', async () => {
    versionCounts = { unlinked: 0, missingCore: 3, fieldMismatch: 0 };
    versionOrphan = 1;

    await service.runConsistencyCheck();

    expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
      key: MetricsKeys.WorkflowCoreConsistencyVersionDrift,
      amount: 3,
      attributes: { driftType: 'missingCore' },
    });
    expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
      key: MetricsKeys.WorkflowCoreConsistencyVersionDrift,
      amount: 1,
      attributes: { driftType: 'orphanCore' },
    });
  });

  it('flags an automated trigger present in the cache but not the table', async () => {
    cacheByWorkflowId = {
      wf1: {
        workflowId: 'wf1',
        workflowVersionId: 'v1',
        type: AutomatedTriggerType.CRON,
        settings: { pattern: '* * * * *' },
      },
    };
    triggerRows = [];

    await service.runConsistencyCheck();

    expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
      key: MetricsKeys.WorkflowCoreConsistencyAutomatedTriggerDrift,
      amount: 1,
      attributes: { driftType: 'inCacheNotTable' },
    });
  });

  it('flags an automated trigger present in the table but not the cache', async () => {
    triggerRows = [
      {
        workflowId: 'wf1',
        type: AutomatedTriggerType.DATABASE_EVENT,
        settings: { eventName: 'person.created' },
      },
    ];
    cacheByWorkflowId = {};

    await service.runConsistencyCheck();

    expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
      key: MetricsKeys.WorkflowCoreConsistencyAutomatedTriggerDrift,
      amount: 1,
      attributes: { driftType: 'inTableNotCache' },
    });
  });

  it('flags an automated trigger whose settings differ between table and cache', async () => {
    cacheByWorkflowId = {
      wf1: {
        workflowId: 'wf1',
        workflowVersionId: 'v1',
        type: AutomatedTriggerType.DATABASE_EVENT,
        settings: { eventName: 'person.created' },
      },
    };
    triggerRows = [
      {
        workflowId: 'wf1',
        type: AutomatedTriggerType.DATABASE_EVENT,
        settings: { eventName: 'company.created' },
      },
    ];

    await service.runConsistencyCheck();

    expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
      key: MetricsKeys.WorkflowCoreConsistencyAutomatedTriggerDrift,
      amount: 1,
      attributes: { driftType: 'mismatch' },
    });
  });

  it('enumerates active and suspended workspaces instead of workspaces having core rows', async () => {
    await service.runConsistencyCheck();

    expect(coreDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining(`"activationStatus" IN ('ACTIVE', 'SUSPENDED')`),
    );
    expect(coreDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining(`"databaseSchema" IS NOT NULL`),
    );
  });

  it('gates on source workflows OR core rows so orphan core rows are still checked', async () => {
    await service.runConsistencyCheck();

    expect(coreDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining(`OR EXISTS (SELECT 1 FROM core."workflow"`),
      [workspaceId],
    );
  });

  it('skips workspaces that have no workflow rows', async () => {
    shouldCheck = false;
    workflowCounts = { unlinked: 5, missingCore: 0, fieldMismatch: 0 };

    await service.runConsistencyCheck();

    expect(metricsService.incrementCounterBy).not.toHaveBeenCalled();
    expect(workspaceCacheService.getOrRecompute).not.toHaveBeenCalled();
  });

  it('excludes soft-deleted rows from the automated trigger comparison', async () => {
    await service.runConsistencyCheck();

    expect(coreDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining(
        `"workflowAutomatedTrigger" WHERE "deletedAt" IS NULL`,
      ),
    );
  });

  it('skips a workspace whose schema is not migrated without reporting to Sentry', async () => {
    const undefinedColumnError = new QueryFailedError(
      'SELECT',
      [],
      Object.assign(new Error('column wf.coreWorkflowId does not exist'), {
        code: '42703',
      }),
    );

    coreDataSource.query.mockImplementation((sql: string) => {
      if (sql.includes('FROM core."workspace"')) {
        return Promise.resolve([{ workspaceId, databaseSchema: schema }]);
      }

      return Promise.reject(undefinedColumnError);
    });

    await expect(service.runConsistencyCheck()).resolves.toBeUndefined();

    expect(exceptionHandlerService.captureExceptions).not.toHaveBeenCalled();
  });

  it('isolates a per-workspace failure and reports it to Sentry', async () => {
    coreDataSource.query.mockImplementation((sql: string) => {
      if (sql.includes('FROM core."workspace"')) {
        return Promise.resolve([{ workspaceId, databaseSchema: schema }]);
      }

      return Promise.reject(new Error('boom'));
    });

    await expect(service.runConsistencyCheck()).resolves.toBeUndefined();

    expect(exceptionHandlerService.captureExceptions).toHaveBeenCalledWith(
      [expect.any(Error)],
      { workspace: { id: workspaceId } },
    );
  });
});
