import { type Repository } from 'typeorm';

import { type PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { type WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
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
  const workspaceService = {
    enqueueWorkspaceDeletionApplicationUninstall: jest.fn(),
    enqueueWorkspaceSuspensionApplicationUninstall: jest.fn(),
  };
  const postgresAdvisoryLockService = {
    tryWithLock: jest.fn(),
  };

  const createJob = () =>
    new CleanSuspendedWorkspacesJob(
      cleanerWorkspaceService as unknown as CleanerWorkspaceService,
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
      workspaceService as unknown as WorkspaceService,
      postgresAdvisoryLockService as unknown as PostgresAdvisoryLockService,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    workspaceRepository.find
      .mockResolvedValueOnce([{ id: 'workspace-id' }])
      .mockResolvedValueOnce([]);
  });

  it('should skip cleanup when another execution holds the lock', async () => {
    postgresAdvisoryLockService.tryWithLock.mockResolvedValue({
      acquired: false,
    });

    await createJob().handle();

    expect(workspaceRepository.find).not.toHaveBeenCalled();
    expect(
      cleanerWorkspaceService.batchWarnOrCleanSuspendedWorkspaces,
    ).not.toHaveBeenCalled();
  });

  it('should clean suspended workspaces when the lock is acquired', async () => {
    postgresAdvisoryLockService.tryWithLock.mockImplementation(
      async (_lockName, callback) => ({
        acquired: true,
        value: await callback(),
      }),
    );

    await createJob().handle();

    expect(workspaceRepository.find).toHaveBeenNthCalledWith(1, {
      select: ['id', 'deletedAt', 'suspendedAt'],
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

  it('should re-enqueue lifecycle hooks when workspaces remain eligible', async () => {
    const workspaceSuspendedAt = new Date('2026-08-18T11:00:00.000Z');

    workspaceRepository.find.mockReset();
    workspaceRepository.find
      .mockResolvedValueOnce([
        {
          id: 'suspended-workspace-id',
          deletedAt: null,
          suspendedAt: workspaceSuspendedAt,
        },
      ])
      .mockResolvedValueOnce([{ id: 'deleted-workspace-id' }]);
    postgresAdvisoryLockService.tryWithLock.mockImplementation(
      async (_lockName, callback) => ({
        acquired: true,
        value: await callback(),
      }),
    );

    await createJob().handle();

    expect(
      workspaceService.enqueueWorkspaceDeletionApplicationUninstall,
    ).toHaveBeenCalledWith('deleted-workspace-id');
    expect(
      workspaceService.enqueueWorkspaceSuspensionApplicationUninstall,
    ).toHaveBeenCalledWith({
      workspaceId: 'suspended-workspace-id',
      workspaceSuspensionUninstallRequestedAt: workspaceSuspendedAt,
    });
  });
});
