import { type Repository } from 'typeorm';

import { type PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
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
  const postgresAdvisoryLockService = {
    tryWithLock: jest.fn(),
  };

  const createJob = () =>
    new CleanSuspendedWorkspacesJob(
      cleanerWorkspaceService as unknown as CleanerWorkspaceService,
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
      postgresAdvisoryLockService as unknown as PostgresAdvisoryLockService,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    workspaceRepository.find.mockResolvedValue([{ id: 'workspace-id' }]);
  });

  it('skips cleanup when another execution holds the lock', async () => {
    postgresAdvisoryLockService.tryWithLock.mockResolvedValue({
      acquired: false,
    });

    await createJob().handle();

    expect(workspaceRepository.find).not.toHaveBeenCalled();
    expect(
      cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces,
    ).not.toHaveBeenCalled();
  });

  it('cleans suspended workspaces while holding the lock', async () => {
    postgresAdvisoryLockService.tryWithLock.mockImplementation(
      async (_lockName, callback) => ({
        acquired: true,
        value: await callback(),
      }),
    );

    await createJob().handle();

    expect(workspaceRepository.find).toHaveBeenCalledWith({
      select: ['id'],
      where: {
        activationStatus: 'SUSPENDED',
      },
      withDeleted: true,
    });
    expect(
      cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces,
    ).toHaveBeenCalledWith({
      workspaceIds: ['workspace-id'],
    });
  });
});
