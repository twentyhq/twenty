import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type DataSource, type EntityManager } from 'typeorm';

import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowCleanWorkflowRunsJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-clean-workflow-runs.job';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const WORKFLOW_RUN_OBJECT_METADATA_ID = 'workflow-run-object-metadata-id';

const buildJob = (deletedRunIdBatches: string[][]) => {
  const remainingBatches = [...deletedRunIdBatches];
  const manager = {
    query: jest.fn(async () => {
      const deletedRunIds = remainingBatches.shift() ?? [];

      return [deletedRunIds.map((id) => ({ id })), deletedRunIds.length];
    }),
  } as unknown as EntityManager;
  const dataSource = {
    transaction: jest.fn(
      (work: (transactionManager: EntityManager) => Promise<unknown>) =>
        work(manager),
    ),
  } as unknown as DataSource;
  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((work: () => Promise<unknown>) =>
      work(),
    ),
  } as unknown as WorkspaceOrmManager;
  const workspaceCacheService = {
    getOrRecompute: jest.fn(async () => ({
      flatObjectMetadataMaps: {
        byUniversalIdentifier: {
          [STANDARD_OBJECTS.workflowRun.universalIdentifier]: {
            id: WORKFLOW_RUN_OBJECT_METADATA_ID,
          },
        },
      },
    })),
  } as unknown as WorkspaceCacheService;
  const recordShareStorageService = {
    deleteByRecordIdsInTransaction: jest.fn(),
  };

  const job = new WorkflowCleanWorkflowRunsJob(
    workspaceOrmManager,
    dataSource,
    workspaceCacheService,
    recordShareStorageService as unknown as RecordShareStorageService,
  );

  return { job, manager, recordShareStorageService };
};

describe('WorkflowCleanWorkflowRunsJob', () => {
  it('should delete the record shares of each batch of deleted runs within its transaction', async () => {
    const { job, manager, recordShareStorageService } = buildJob([
      ['old-run-1', 'old-run-2'],
      [],
      ['excess-run-1'],
    ]);

    await job.handle({ workspaceId: WORKSPACE_ID });

    expect(
      recordShareStorageService.deleteByRecordIdsInTransaction.mock.calls.map(
        ([args]) => args,
      ),
    ).toEqual([
      {
        workspaceId: WORKSPACE_ID,
        objectMetadataId: WORKFLOW_RUN_OBJECT_METADATA_ID,
        recordIds: ['old-run-1', 'old-run-2'],
        manager,
      },
      {
        workspaceId: WORKSPACE_ID,
        objectMetadataId: WORKFLOW_RUN_OBJECT_METADATA_ID,
        recordIds: [],
        manager,
      },
      {
        workspaceId: WORKSPACE_ID,
        objectMetadataId: WORKFLOW_RUN_OBJECT_METADATA_ID,
        recordIds: ['excess-run-1'],
        manager,
      },
      {
        workspaceId: WORKSPACE_ID,
        objectMetadataId: WORKFLOW_RUN_OBJECT_METADATA_ID,
        recordIds: [],
        manager,
      },
    ]);
  });
});
