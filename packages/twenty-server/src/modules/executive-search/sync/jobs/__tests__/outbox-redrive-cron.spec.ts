import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FeatureFlagKey } from 'twenty-shared/types';
import {
  ExecutiveSearchOutboxRedriveJob,
  EXECUTIVE_SYNC_OUTBOX_REDRIVE_JOB_NAME,
} from 'src/modules/executive-search/sync/jobs/executive-sync-outbox-redrive.job';
import { ExecutiveSyncProcessOutboxJob } from 'src/modules/executive-search/sync/jobs/executive-sync-process-outbox.job';
import { ExecutiveSearchOutboxService } from 'src/modules/executive-search/sync/services/outbox.service';

describe('ExecutiveSearchOutboxRedriveJob', () => {
  let job: ExecutiveSearchOutboxRedriveJob;
  let mockWorkspaceRepository: { find: jest.Mock };
  let mockFeatureFlagService: { isFeatureEnabled: jest.Mock };
  let mockOutboxService: {
    findReadyForRetry: jest.Mock;
    findStaleProcessing: jest.Mock;
  };
  let mockExecutiveSyncQueue: { add: jest.Mock };

  beforeEach(async () => {
    mockWorkspaceRepository = { find: jest.fn() };
    mockFeatureFlagService = { isFeatureEnabled: jest.fn() };
    mockOutboxService = {
      findReadyForRetry: jest.fn().mockResolvedValue([]),
      findStaleProcessing: jest.fn().mockResolvedValue([]),
    };
    mockExecutiveSyncQueue = { add: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutiveSearchOutboxRedriveJob,
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: mockWorkspaceRepository,
        },
        {
          provide: FeatureFlagService,
          useValue: mockFeatureFlagService,
        },
        {
          provide: ExecutiveSearchOutboxService,
          useValue: mockOutboxService,
        },
        {
          provide: getQueueToken(MessageQueue.executiveSyncQueue),
          useValue: mockExecutiveSyncQueue,
        },
      ],
    }).compile();

    job = module.get(ExecutiveSearchOutboxRedriveJob);
  });

  it('should have the correct job name constant', () => {
    expect(EXECUTIVE_SYNC_OUTBOX_REDRIVE_JOB_NAME).toBe(
      'ExecutiveSearchOutboxRedriveJob',
    );
  });

  it('should enumerate workspaces and redrive ready entries', async () => {
    mockWorkspaceRepository.find.mockResolvedValue([
      { id: 'ws-1' },
      { id: 'ws-2' },
    ]);
    mockFeatureFlagService.isFeatureEnabled.mockResolvedValue(true);
    mockOutboxService.findReadyForRetry.mockImplementation(
      async (workspaceId: string) => {
        if (workspaceId === 'ws-1') {
          return [
            { id: 'out-1', status: 'PENDING' },
            { id: 'out-2', status: 'PENDING' },
          ];
        }
        return [{ id: 'out-3', status: 'PENDING' }];
      },
    );
    mockOutboxService.findStaleProcessing.mockResolvedValue([]);

    await job.handle();

    expect(mockOutboxService.findReadyForRetry).toHaveBeenCalledTimes(2);
    expect(mockOutboxService.findReadyForRetry).toHaveBeenCalledWith(
      'ws-1',
      100,
    );
    expect(mockOutboxService.findReadyForRetry).toHaveBeenCalledWith(
      'ws-2',
      100,
    );

    expect(mockExecutiveSyncQueue.add).toHaveBeenCalledTimes(3);
    expect(mockExecutiveSyncQueue.add).toHaveBeenCalledWith(
      ExecutiveSyncProcessOutboxJob.name,
      { workspaceId: 'ws-1', outboxId: 'out-1' },
    );
    expect(mockExecutiveSyncQueue.add).toHaveBeenCalledWith(
      ExecutiveSyncProcessOutboxJob.name,
      { workspaceId: 'ws-1', outboxId: 'out-2' },
    );
    expect(mockExecutiveSyncQueue.add).toHaveBeenCalledWith(
      ExecutiveSyncProcessOutboxJob.name,
      { workspaceId: 'ws-2', outboxId: 'out-3' },
    );
  });

  it('should skip workspace when feature flag is off', async () => {
    mockWorkspaceRepository.find.mockResolvedValue([
      { id: 'ws-1' },
      { id: 'ws-2' },
    ]);
    mockFeatureFlagService.isFeatureEnabled.mockImplementation(
      async (_key: FeatureFlagKey, workspaceId: string) =>
        workspaceId === 'ws-2',
    );
    mockOutboxService.findReadyForRetry.mockResolvedValue([]);
    mockOutboxService.findStaleProcessing.mockResolvedValue([]);

    await job.handle();

    // ws-1 should be skipped
    expect(mockOutboxService.findReadyForRetry).toHaveBeenCalledTimes(1);
    expect(mockOutboxService.findReadyForRetry).toHaveBeenCalledWith(
      'ws-2',
      100,
    );
    expect(mockFeatureFlagService.isFeatureEnabled).toHaveBeenCalledWith(
      FeatureFlagKey.IS_EXECUTIVE_SEARCH_OUTBOUND_PUBLISH_ENABLED,
      'ws-1',
    );
    expect(mockFeatureFlagService.isFeatureEnabled).toHaveBeenCalledWith(
      FeatureFlagKey.IS_EXECUTIVE_SEARCH_OUTBOUND_PUBLISH_ENABLED,
      'ws-2',
    );
  });

  it('should do nothing when no ready entries for any workspace', async () => {
    mockWorkspaceRepository.find.mockResolvedValue([
      { id: 'ws-1' },
      { id: 'ws-2' },
    ]);
    mockFeatureFlagService.isFeatureEnabled.mockResolvedValue(true);
    mockOutboxService.findReadyForRetry.mockResolvedValue([]);
    mockOutboxService.findStaleProcessing.mockResolvedValue([]);

    await job.handle();

    expect(mockOutboxService.findReadyForRetry).toHaveBeenCalledTimes(2);
    expect(mockOutboxService.findStaleProcessing).toHaveBeenCalledTimes(2);
    expect(mockExecutiveSyncQueue.add).not.toHaveBeenCalled();
  });

  it('should redrive stale PROCESSING entries (updatedAt > 5 min old)', async () => {
    mockWorkspaceRepository.find.mockResolvedValue([{ id: 'ws-1' }]);
    mockFeatureFlagService.isFeatureEnabled.mockResolvedValue(true);
    mockOutboxService.findReadyForRetry.mockResolvedValue([]);
    mockOutboxService.findStaleProcessing.mockResolvedValue([
      { id: 'stale-1', status: 'PROCESSING' },
      { id: 'stale-2', status: 'PROCESSING' },
    ]);

    await job.handle();

    expect(mockOutboxService.findStaleProcessing).toHaveBeenCalledWith(
      'ws-1',
      100,
    );
    expect(mockExecutiveSyncQueue.add).toHaveBeenCalledTimes(2);
    expect(mockExecutiveSyncQueue.add).toHaveBeenCalledWith(
      ExecutiveSyncProcessOutboxJob.name,
      { workspaceId: 'ws-1', outboxId: 'stale-1' },
    );
    expect(mockExecutiveSyncQueue.add).toHaveBeenCalledWith(
      ExecutiveSyncProcessOutboxJob.name,
      { workspaceId: 'ws-1', outboxId: 'stale-2' },
    );
  });
});
