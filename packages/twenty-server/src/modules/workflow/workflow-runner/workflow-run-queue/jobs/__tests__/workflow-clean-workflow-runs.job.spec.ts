import { type DataSource, type EntityManager } from 'typeorm';

import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkflowCleanWorkflowRunsJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-clean-workflow-runs.job';

jest.mock(
  'src/engine/twenty-orm/storage/orm-workspace-context.storage',
  () => ({ getWorkspaceContext: jest.fn() }),
);

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const WORKFLOW_RUN_OBJECT_METADATA_ID = 'workflowRun-object-metadata-id';
const DELETED_RUN_ID_BATCHES = [
  ['old-run-1', 'old-run-2'],
  [],
  ['excess-run-1'],
];

type StandardObjectName = 'workflowRun' | 'recordShare';

const buildJob = ({
  standardObjectNames = ['workflowRun', 'recordShare'],
}: {
  standardObjectNames?: StandardObjectName[];
} = {}) => {
  const remainingBatches = [...DELETED_RUN_ID_BATCHES];
  const manager = {
    query: jest.fn(async () => {
      const deletedRunIds = remainingBatches.shift() ?? [];

      return [deletedRunIds.map((id) => ({ id })), deletedRunIds.length];
    }),
  };
  const dataSource = {
    transaction: jest.fn(
      (work: (transactionManager: EntityManager) => Promise<unknown>) =>
        work(manager as unknown as EntityManager),
    ),
  } as unknown as DataSource;
  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((work: () => Promise<unknown>) =>
      work(),
    ),
  } as unknown as WorkspaceOrmManager;
  const recordShareStorageService = {
    deleteByRecordIdsInTransaction: jest.fn(),
  };

  jest.mocked(getWorkspaceContext).mockReturnValue({
    objectIdByNameSingular: Object.fromEntries(
      standardObjectNames.map((standardObjectName) => [
        standardObjectName,
        `${standardObjectName}-object-metadata-id`,
      ]),
    ),
  } as never);

  const job = new WorkflowCleanWorkflowRunsJob(
    workspaceOrmManager,
    dataSource,
    recordShareStorageService as unknown as RecordShareStorageService,
  );

  return { job, manager, recordShareStorageService };
};

describe('WorkflowCleanWorkflowRunsJob', () => {
  it('should delete the record shares of each batch of deleted runs within its transaction', async () => {
    const { job, manager, recordShareStorageService } = buildJob();

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

  it.each<{
    missingObjectName: StandardObjectName;
    standardObjectNames: StandardObjectName[];
  }>([
    { missingObjectName: 'workflowRun', standardObjectNames: ['recordShare'] },
    { missingObjectName: 'recordShare', standardObjectNames: ['workflowRun'] },
  ])(
    'should delete runs without touching shares when the $missingObjectName object is absent',
    async ({ standardObjectNames }) => {
      const { job, manager, recordShareStorageService } = buildJob({
        standardObjectNames,
      });

      await job.handle({ workspaceId: WORKSPACE_ID });

      expect(manager.query).toHaveBeenCalledTimes(4);
      expect(
        recordShareStorageService.deleteByRecordIdsInTransaction,
      ).not.toHaveBeenCalled();
    },
  );
});
