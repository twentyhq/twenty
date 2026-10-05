import { type Repository } from 'typeorm';

import { type PostgresAdvisoryLockService } from 'src/database/typeorm/postgres-advisory-lock.service';
import { type ApplicationUninstallService } from 'src/engine/core-modules/application/application-manifest/services/application-uninstall.service';
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
  };
  const applicationUninstallService = {
    findWorkspaceIdsWithPendingUninstallHooks: jest.fn(),
  };
  const postgresAdvisoryLockService = {
    tryWithLock: jest.fn(),
  };

  const createJob = () =>
    new CleanSuspendedWorkspacesJob(
      cleanerWorkspaceService as unknown as CleanerWorkspaceService,
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
      workspaceService as unknown as WorkspaceService,
      applicationUninstallService as unknown as ApplicationUninstallService,
      postgresAdvisoryLockService as unknown as PostgresAdvisoryLockService,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    applicationUninstallService.findWorkspaceIdsWithPendingUninstallHooks.mockImplementation(
      async (workspaceUninstallRequests) =>
        new Set(
          workspaceUninstallRequests.map(
            (request: { workspaceId: string }) => request.workspaceId,
          ),
        ),
    );
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

  it('should re-enqueue deletion hooks when uninstall hooks are still pending', async () => {
    const workspaceDeletedAt = new Date('2026-08-18T12:00:00.000Z');

    workspaceRepository.find.mockReset();
    workspaceRepository.find
      .mockResolvedValueOnce([{ id: 'suspended-workspace-id' }])
      .mockResolvedValueOnce([
        { id: 'deleted-workspace-id', deletedAt: workspaceDeletedAt },
      ]);
    postgresAdvisoryLockService.tryWithLock.mockImplementation(
      async (_lockName, callback) => ({
        acquired: true,
        value: await callback(),
      }),
    );

    await createJob().handle();

    expect(
      applicationUninstallService.findWorkspaceIdsWithPendingUninstallHooks,
    ).toHaveBeenCalledTimes(1);
    expect(
      applicationUninstallService.findWorkspaceIdsWithPendingUninstallHooks,
    ).toHaveBeenCalledWith([
      {
        workspaceId: 'deleted-workspace-id',
        uninstallRequestedAt: workspaceDeletedAt,
      },
    ]);
    expect(
      workspaceService.enqueueWorkspaceDeletionApplicationUninstall,
    ).toHaveBeenCalledWith('deleted-workspace-id');
  });

  it('should not re-enqueue workspaces whose uninstall hooks already completed', async () => {
    applicationUninstallService.findWorkspaceIdsWithPendingUninstallHooks.mockResolvedValue(
      new Set(),
    );
    workspaceRepository.find.mockReset();
    workspaceRepository.find
      .mockResolvedValueOnce([{ id: 'suspended-workspace-id' }])
      .mockResolvedValueOnce([
        {
          id: 'deleted-workspace-id',
          deletedAt: new Date('2026-08-18T12:00:00.000Z'),
        },
      ]);
    postgresAdvisoryLockService.tryWithLock.mockImplementation(
      async (_lockName, callback) => ({
        acquired: true,
        value: await callback(),
      }),
    );

    await createJob().handle();

    expect(
      workspaceService.enqueueWorkspaceDeletionApplicationUninstall,
    ).not.toHaveBeenCalled();
  });
});
