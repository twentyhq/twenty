import { subDays } from 'date-fns';
import { type Repository } from 'typeorm';

import { type KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

const INACTIVE_DAYS_BEFORE_SOFT_DELETION = 30;
const INACTIVE_DAYS_BEFORE_DELETION = 60;
const DESTROY_GRACE_PERIOD_IN_DAYS =
  INACTIVE_DAYS_BEFORE_DELETION - INACTIVE_DAYS_BEFORE_SOFT_DELETION;
const MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION = 2;

const CONFIG: Record<string, number> = {
  WORKSPACE_INACTIVE_DAYS_BEFORE_SOFT_DELETION:
    INACTIVE_DAYS_BEFORE_SOFT_DELETION,
  WORKSPACE_INACTIVE_DAYS_BEFORE_DELETION: INACTIVE_DAYS_BEFORE_DELETION,
  WORKSPACE_INACTIVE_DAYS_BEFORE_NOTIFICATION: 15,
  MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION:
    MAX_NUMBER_OF_WORKSPACES_DELETED_PER_EXECUTION,
};

const buildSoftDeletedWorkspace = (id: string, softDeletedDaysAgo: number) => ({
  id,
  displayName: id,
  deletedAt: subDays(new Date(), softDeletedDaysAgo),
});

describe('CleanerWorkspaceService destroy branch', () => {
  const workspaceRepository = { find: jest.fn() };
  const keyValuePairRepository = { find: jest.fn() };
  const messageQueueService = { add: jest.fn() };
  const twentyConfigService = { get: jest.fn((key: string) => CONFIG[key]) };

  const createService = () =>
    new CleanerWorkspaceService(
      {} as never,
      twentyConfigService as unknown as TwentyConfigService,
      {} as never,
      {} as never,
      {} as never,
      workspaceRepository as unknown as Repository<WorkspaceEntity>,
      keyValuePairRepository as unknown as Repository<KeyValuePairEntity>,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      messageQueueService as unknown as MessageQueueService,
    );

  const getEnqueuedWorkspaceIds = () =>
    messageQueueService.add.mock.calls.map(([, data]) => data.workspaceId);

  beforeEach(() => {
    jest.clearAllMocks();
    keyValuePairRepository.find.mockResolvedValue([]);
    messageQueueService.add.mockImplementation(
      async (_jobName, _data, options) => options.id,
    );
  });

  it('enqueues a deduplicated destruction for a workspace past the grace period', async () => {
    workspaceRepository.find.mockResolvedValue([
      buildSoftDeletedWorkspace(
        'workspace-id',
        DESTROY_GRACE_PERIOD_IN_DAYS + 1,
      ),
    ]);

    await createService().batchWarnOrCleanSuspendedWorkspaces({
      workspaceIds: ['workspace-id'],
    });

    expect(messageQueueService.add).toHaveBeenCalledWith(
      'DestroySoftDeletedWorkspaceJob',
      { workspaceId: 'workspace-id' },
      {
        id: 'destroy-soft-deleted-workspace-workspace-id',
        deduplication: { id: 'destroy-soft-deleted-workspace-workspace-id' },
      },
    );
  });

  it('does not enqueue a workspace still within the grace period', async () => {
    workspaceRepository.find.mockResolvedValue([
      buildSoftDeletedWorkspace(
        'workspace-id',
        DESTROY_GRACE_PERIOD_IN_DAYS - 1,
      ),
    ]);

    await createService().batchWarnOrCleanSuspendedWorkspaces({
      workspaceIds: ['workspace-id'],
    });

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('enqueues a workspace within the grace period when the grace period is ignored', async () => {
    workspaceRepository.find.mockResolvedValue([
      buildSoftDeletedWorkspace(
        'workspace-id',
        DESTROY_GRACE_PERIOD_IN_DAYS - 1,
      ),
    ]);

    await createService().batchWarnOrCleanSuspendedWorkspaces({
      workspaceIds: ['workspace-id'],
      ignoreDestroyGracePeriod: true,
    });

    expect(getEnqueuedWorkspaceIds()).toEqual(['workspace-id']);
  });

  it('enqueues nothing on a dry run', async () => {
    workspaceRepository.find.mockResolvedValue([
      buildSoftDeletedWorkspace(
        'workspace-id',
        DESTROY_GRACE_PERIOD_IN_DAYS + 1,
      ),
    ]);

    await createService().batchWarnOrCleanSuspendedWorkspaces({
      workspaceIds: ['workspace-id'],
      dryRun: true,
    });

    expect(messageQueueService.add).not.toHaveBeenCalled();
  });

  it('stops at the per-execution limit', async () => {
    workspaceRepository.find.mockResolvedValue(
      ['first', 'second', 'third'].map((id) =>
        buildSoftDeletedWorkspace(id, DESTROY_GRACE_PERIOD_IN_DAYS + 1),
      ),
    );

    await createService().batchWarnOrCleanSuspendedWorkspaces({
      workspaceIds: ['first', 'second', 'third'],
    });

    expect(getEnqueuedWorkspaceIds()).toEqual(['first', 'second']);
  });

  it('does not spend a slot of the per-execution limit on an already queued workspace', async () => {
    workspaceRepository.find.mockResolvedValue(
      ['first', 'second', 'third'].map((id) =>
        buildSoftDeletedWorkspace(id, DESTROY_GRACE_PERIOD_IN_DAYS + 1),
      ),
    );
    messageQueueService.add.mockImplementation(
      async (_jobName, data, options) =>
        data.workspaceId === 'first' ? undefined : options.id,
    );

    await createService().batchWarnOrCleanSuspendedWorkspaces({
      workspaceIds: ['first', 'second', 'third'],
    });

    expect(getEnqueuedWorkspaceIds()).toEqual(['first', 'second', 'third']);
  });
});
