import {
  createInMemoryWorkspaceRepository,
  type InMemoryRecord,
} from 'test/utils/create-in-memory-workspace-repository.util';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RECORD_DELETE_BATCH_SIZE } from 'src/engine/twenty-orm/constants/record-delete-batch-size.constant';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { DeleteWorkflowRunsCommand } from 'src/modules/workflow/workflow-runner/workflow-run/command/delete-workflow-runs.command';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const OTHER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000002';

const CREATED_BEFORE = '2026-01-01';
const CREATED_BEFORE_CUTOFF = '2026-01-01T00:00:00.000Z';
const OLD_CREATED_AT = '2025-06-01T00:00:00.000Z';
const RECENT_CREATED_AT = '2026-02-01T00:00:00.000Z';

const buildWorkflowRuns = ({
  count,
  createdAt,
  idPrefix,
  deletedAt = null,
}: {
  count: number;
  createdAt: string;
  idPrefix: string;
  deletedAt?: string | null;
}): InMemoryRecord[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${idPrefix}-${String(index).padStart(6, '0')}`,
    createdAt,
    deletedAt,
  })).reverse();

const getIds = (records: InMemoryRecord[]) =>
  records.map(({ id }) => id).sort();

describe('DeleteWorkflowRunsCommand', () => {
  let command: DeleteWorkflowRunsCommand;
  let workflowRunTables: Record<
    string,
    ReturnType<typeof createInMemoryWorkspaceRepository>
  >;
  let loggerLogSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;
  let runInWorkspaceTransaction: jest.Mock;

  const setWorkflowRuns = (
    workflowRunsByWorkspaceId: Record<string, InMemoryRecord[]>,
  ) => {
    workflowRunTables = Object.fromEntries(
      Object.entries(workflowRunsByWorkspaceId).map(
        ([workspaceId, workflowRuns]) => [
          workspaceId,
          createInMemoryWorkspaceRepository(workflowRuns),
        ],
      ),
    );
  };

  const getWorkflowRunTable = (workspaceId: string) =>
    workflowRunTables[workspaceId];

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  beforeEach(() => {
    let currentWorkspaceId: string | undefined;

    runInWorkspaceTransaction = jest.fn(
      (work: (transactionScope: WorkspaceTransactionScope) => unknown) =>
        work({
          getRepository: () =>
            getWorkflowRunTable(currentWorkspaceId as string).repository,
        } as unknown as WorkspaceTransactionScope),
    );

    const workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(
        async (
          callback: () => Promise<void>,
          authContext: WorkspaceAuthContext,
        ) => {
          currentWorkspaceId = authContext.workspace.id;

          try {
            return await callback();
          } finally {
            currentWorkspaceId = undefined;
          }
        },
      ),
      getRepository: jest.fn(
        () => getWorkflowRunTable(currentWorkspaceId as string).repository,
      ),
      runInWorkspaceTransaction,
    };

    command = new DeleteWorkflowRunsCommand(
      workspaceOrmManager as unknown as WorkspaceOrmManager,
      {} as WorkspaceIteratorService,
    );

    loggerLogSpy = jest.spyOn(command['logger'], 'log').mockImplementation();
    loggerErrorSpy = jest
      .spyOn(command['logger'], 'error')
      .mockImplementation();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should delete every run created before the cutoff in batches of at most RECORD_DELETE_BATCH_SIZE', async () => {
    const oldWorkflowRuns = buildWorkflowRuns({
      count: 2 * RECORD_DELETE_BATCH_SIZE + 500,
      createdAt: OLD_CREATED_AT,
      idPrefix: 'old',
    });
    const oldSoftDeletedWorkflowRuns = buildWorkflowRuns({
      count: 3,
      createdAt: OLD_CREATED_AT,
      idPrefix: 'old-trashed',
      deletedAt: OLD_CREATED_AT,
    });
    const recentWorkflowRuns = buildWorkflowRuns({
      count: 5,
      createdAt: RECENT_CREATED_AT,
      idPrefix: 'recent',
    });
    const otherWorkspaceWorkflowRuns = buildWorkflowRuns({
      count: 5,
      createdAt: OLD_CREATED_AT,
      idPrefix: 'other-workspace',
    });

    setWorkflowRuns({
      [WORKSPACE_ID]: [
        ...recentWorkflowRuns,
        ...oldWorkflowRuns,
        ...oldSoftDeletedWorkflowRuns,
      ],
      [OTHER_WORKSPACE_ID]: otherWorkspaceWorkflowRuns,
    });
    command.parseCreatedBefore(CREATED_BEFORE);

    await runOnWorkspace();

    const workflowRunTable = getWorkflowRunTable(WORKSPACE_ID);
    const deletedIdsByCall = workflowRunTable.getDeletedIdsByCall();

    expect(deletedIdsByCall.map((deletedIds) => deletedIds.length)).toEqual([
      RECORD_DELETE_BATCH_SIZE,
      RECORD_DELETE_BATCH_SIZE,
      503,
    ]);
    expect(runInWorkspaceTransaction).toHaveBeenCalledTimes(3);
    expect(getIds(deletedIdsByCall.flat().map((id) => ({ id })))).toEqual(
      getIds([...oldWorkflowRuns, ...oldSoftDeletedWorkflowRuns]),
    );
    expect(getIds(workflowRunTable.getRecords())).toEqual(
      getIds(recentWorkflowRuns),
    );
    expect(
      getIds(getWorkflowRunTable(OTHER_WORKSPACE_ID).getRecords()),
    ).toEqual(getIds(otherWorkspaceWorkflowRuns));
    expect(loggerLogSpy).toHaveBeenCalledWith(
      `Deleted ${oldWorkflowRuns.length + oldSoftDeletedWorkflowRuns.length} workflow runs`,
    );
  });

  it('should delete old runs that are all soft-deleted', async () => {
    const oldSoftDeletedWorkflowRuns = buildWorkflowRuns({
      count: 3,
      createdAt: OLD_CREATED_AT,
      idPrefix: 'old-trashed',
      deletedAt: OLD_CREATED_AT,
    });
    const recentWorkflowRuns = buildWorkflowRuns({
      count: 5,
      createdAt: RECENT_CREATED_AT,
      idPrefix: 'recent',
    });

    setWorkflowRuns({
      [WORKSPACE_ID]: [...oldSoftDeletedWorkflowRuns, ...recentWorkflowRuns],
    });
    command.parseCreatedBefore(CREATED_BEFORE);

    await runOnWorkspace();

    expect(getIds(getWorkflowRunTable(WORKSPACE_ID).getRecords())).toEqual(
      getIds(recentWorkflowRuns),
    );
    expect(loggerLogSpy).toHaveBeenCalledWith('Deleted 3 workflow runs');
  });

  it('should not delete anything when no run is older than the cutoff', async () => {
    const recentWorkflowRuns = buildWorkflowRuns({
      count: 5,
      createdAt: RECENT_CREATED_AT,
      idPrefix: 'recent',
    });

    setWorkflowRuns({ [WORKSPACE_ID]: recentWorkflowRuns });
    command.parseCreatedBefore(CREATED_BEFORE);

    await runOnWorkspace();

    const workflowRunTable = getWorkflowRunTable(WORKSPACE_ID);

    expect(workflowRunTable.repository.delete).not.toHaveBeenCalled();
    expect(getIds(workflowRunTable.getRecords())).toEqual(
      getIds(recentWorkflowRuns),
    );
    expect(loggerLogSpy).toHaveBeenCalledWith('Deleted 0 workflow runs');
  });

  it('should only count matching runs on a dry run', async () => {
    const workflowRuns = [
      ...buildWorkflowRuns({
        count: RECORD_DELETE_BATCH_SIZE + 1,
        createdAt: OLD_CREATED_AT,
        idPrefix: 'old',
      }),
      ...buildWorkflowRuns({
        count: 5,
        createdAt: RECENT_CREATED_AT,
        idPrefix: 'recent',
      }),
    ];

    setWorkflowRuns({ [WORKSPACE_ID]: workflowRuns });
    command.parseCreatedBefore(CREATED_BEFORE);

    await runOnWorkspace(true);

    const workflowRunTable = getWorkflowRunTable(WORKSPACE_ID);

    expect(workflowRunTable.repository.delete).not.toHaveBeenCalled();
    expect(getIds(workflowRunTable.getRecords())).toEqual(getIds(workflowRuns));
    expect(loggerLogSpy).toHaveBeenCalledWith(
      ` (DRY RUN): Deleted ${RECORD_DELETE_BATCH_SIZE + 1} workflow runs`,
    );
  });

  it('should keep the default cutoff fixed while batches are deleted', async () => {
    jest.useFakeTimers({ now: new Date(CREATED_BEFORE_CUTOFF) });

    const oldWorkflowRuns = buildWorkflowRuns({
      count: RECORD_DELETE_BATCH_SIZE + 10,
      createdAt: OLD_CREATED_AT,
      idPrefix: 'old',
    });
    const workflowRunsCreatedDuringRun = buildWorkflowRuns({
      count: 5,
      createdAt: '2026-01-01T00:00:01.000Z',
      idPrefix: 'recent',
    });

    setWorkflowRuns({
      [WORKSPACE_ID]: [...oldWorkflowRuns, ...workflowRunsCreatedDuringRun],
    });

    const workflowRunTable = getWorkflowRunTable(WORKSPACE_ID);

    workflowRunTable.repository.delete.mockImplementation(async (criteria) => {
      jest.setSystemTime(new Date('2026-01-01T01:00:00.000Z'));

      return workflowRunTable.deleteRecords(criteria);
    });

    await runOnWorkspace();

    expect(getIds(workflowRunTable.getRecords())).toEqual(
      getIds(workflowRunsCreatedDuringRun),
    );
  });

  it('should stop and log when a batch fails, keeping the batches already deleted', async () => {
    const oldWorkflowRuns = buildWorkflowRuns({
      count: 2 * RECORD_DELETE_BATCH_SIZE + 500,
      createdAt: OLD_CREATED_AT,
      idPrefix: 'old',
    });

    setWorkflowRuns({ [WORKSPACE_ID]: oldWorkflowRuns });
    command.parseCreatedBefore(CREATED_BEFORE);

    const workflowRunTable = getWorkflowRunTable(WORKSPACE_ID);
    const deletionError = new Error('Deletion failed');

    workflowRunTable.repository.delete
      .mockImplementationOnce(workflowRunTable.deleteRecords)
      .mockRejectedValueOnce(deletionError);

    await runOnWorkspace();

    expect(workflowRunTable.repository.delete).toHaveBeenCalledTimes(2);
    expect(workflowRunTable.getRecords()).toHaveLength(
      oldWorkflowRuns.length - RECORD_DELETE_BATCH_SIZE,
    );
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Error while deleting workflowRun',
      deletionError,
    );
  });
});
