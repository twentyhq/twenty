import { type DataSource, type QueryRunner, type Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CleanSuspendedWorkspacesJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-suspended-workspaces.job';
import { type CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

jest.mock(
  'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service',
  () => ({
    CleanerWorkspaceService: class {},
  }),
);

describe('CleanSuspendedWorkspacesJob', () => {
  const workspaceRepository = {
    find: jest.fn(),
  };
  const cleanerWorkspaceService = {
    batchWarnOrCleanSuspendedWorkspaces: jest.fn(),
  };
  const createQueryRunner = jest.fn();
  const coreDataSource = {
    createQueryRunner,
  };

  const createMockQueryRunner = (isLockAcquired: boolean) => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ acquired: isLockAcquired }])
      .mockResolvedValueOnce([{ released: true }]);

    return {
      connect: jest.fn(),
      query,
      release: jest.fn(),
    } as unknown as QueryRunner;
  };

  const createJob = () =>
    new CleanSuspendedWorkspacesJob(
      cleanerWorkspaceService as unknown as CleanerWorkspaceService,
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
      coreDataSource as unknown as DataSource,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    workspaceRepository.find.mockResolvedValue([{ id: 'workspace-id' }]);
  });

  it('skips a concurrent execution while the cleanup lock is held', async () => {
    const ownerQueryRunner = createMockQueryRunner(true);
    const contenderQueryRunner = createMockQueryRunner(false);

    createQueryRunner
      .mockReturnValueOnce(ownerQueryRunner)
      .mockReturnValueOnce(contenderQueryRunner);

    let resolveCleanupStarted!: () => void;
    const cleanupStarted = new Promise<void>((resolve) => {
      resolveCleanupStarted = resolve;
    });
    let resolveCleanup!: () => void;
    const cleanup = new Promise<void>((resolve) => {
      resolveCleanup = resolve;
    });

    cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces.mockImplementation(
      async () => {
        resolveCleanupStarted();
        await cleanup;
      },
    );

    const job = createJob();
    const ownerExecution = job.handle();

    await cleanupStarted;
    await job.handle();

    expect(workspaceRepository.find).toHaveBeenCalledTimes(1);
    expect(
      cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces,
    ).toHaveBeenCalledTimes(1);
    expect(contenderQueryRunner.query).toHaveBeenCalledTimes(1);
    expect(contenderQueryRunner.release).toHaveBeenCalledTimes(1);

    resolveCleanup();
    await ownerExecution;

    expect(ownerQueryRunner.query).toHaveBeenCalledTimes(2);
    expect(ownerQueryRunner.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('pg_advisory_unlock'),
      expect.any(Array),
    );
    expect(
      (ownerQueryRunner.query as jest.Mock).mock.invocationCallOrder[1],
    ).toBeLessThan(
      (ownerQueryRunner.release as jest.Mock).mock.invocationCallOrder[0],
    );
  });

  it('releases the cleanup lock when cleanup fails', async () => {
    const queryRunner = createMockQueryRunner(true);
    const cleanupError = new Error('cleanup failed');

    createQueryRunner.mockReturnValue(queryRunner);
    cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces.mockRejectedValue(
      cleanupError,
    );

    await expect(createJob().handle()).rejects.toThrow(cleanupError);

    expect(queryRunner.query).toHaveBeenCalledTimes(2);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });
});
