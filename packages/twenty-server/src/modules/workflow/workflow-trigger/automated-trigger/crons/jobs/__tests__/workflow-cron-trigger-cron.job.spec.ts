import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WORKFLOW_CRON_TRIGGER_CACHE_KEY } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-key.constant';
import { WORKFLOW_CRON_TRIGGER_CACHE_TTL_MS } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-ttl.constant';
import { WorkflowCronTriggerCronJob } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/jobs/workflow-cron-trigger-cron.job';
import { WorkflowTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';

const WORKSPACE_1 = '20202020-0000-0000-0000-000000000001';
const WORKSPACE_2 = '20202020-0000-0000-0000-000000000002';
const WORKSPACE_3 = '20202020-0000-0000-0000-000000000003';

const mockCoreDataSource = {
  query: jest.fn(),
};

const mockWorkspaceRepository = {
  find: jest.fn(),
};

const mockMessageQueueService = {
  add: jest.fn(),
};

const mockExceptionHandlerService = {
  captureExceptions: jest.fn(),
};

const mockCacheStorageService = {
  setMembers: jest.fn(),
  setAdd: jest.fn(),
};

describe('WorkflowCronTriggerCronJob', () => {
  let job: WorkflowCronTriggerCronJob;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-02T15:00:30.000Z'));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowCronTriggerCronJob,
        {
          provide: getDataSourceToken(),
          useValue: mockCoreDataSource,
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: mockWorkspaceRepository,
        },
        {
          provide: 'MESSAGE_QUEUE_workflow-queue',
          useValue: mockMessageQueueService,
        },
        {
          provide: ExceptionHandlerService,
          useValue: mockExceptionHandlerService,
        },
        {
          provide: CacheStorageNamespace.ModuleWorkflow,
          useValue: mockCacheStorageService,
        },
      ],
    }).compile();

    job = module.get<WorkflowCronTriggerCronJob>(WorkflowCronTriggerCronJob);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('handle - cache hit', () => {
    it('should query only cached workspaces when cache exists', async () => {
      mockCacheStorageService.setMembers.mockResolvedValue([
        WORKSPACE_1,
        WORKSPACE_2,
      ]);
      mockCoreDataSource.query.mockResolvedValue([]);

      await job.handle();

      expect(mockCacheStorageService.setMembers).toHaveBeenCalledWith(
        WORKFLOW_CRON_TRIGGER_CACHE_KEY,
      );
      expect(mockWorkspaceRepository.find).not.toHaveBeenCalled();
      expect(mockCoreDataSource.query).toHaveBeenCalledTimes(2);
    });

    it('should enqueue jobs for matching cron triggers', async () => {
      mockCacheStorageService.setMembers.mockResolvedValue([WORKSPACE_1]);
      mockCoreDataSource.query.mockResolvedValue([
        {
          id: 'trigger-1',
          workflowId: 'workflow-1',
          settings: { pattern: '* * * * *' },
        },
      ]);

      await job.handle();

      expect(mockMessageQueueService.add).toHaveBeenCalledWith(
        WorkflowTriggerJob.name,
        {
          workspaceId: WORKSPACE_1,
          workflowId: 'workflow-1',
          payload: {},
        },
        { retryLimit: 3 },
      );
    });

    it('should not enqueue jobs when cron pattern does not match', async () => {
      mockCacheStorageService.setMembers.mockResolvedValue([WORKSPACE_1]);
      mockCoreDataSource.query.mockResolvedValue([
        {
          id: 'trigger-1',
          workflowId: 'workflow-1',
          settings: { pattern: '0 0 1 1 *' },
        },
      ]);

      await job.handle();

      expect(mockMessageQueueService.add).not.toHaveBeenCalled();
    });

    it('should skip triggers with undefined pattern', async () => {
      mockCacheStorageService.setMembers.mockResolvedValue([WORKSPACE_1]);
      mockCoreDataSource.query.mockResolvedValue([
        {
          id: 'trigger-1',
          workflowId: 'workflow-1',
          settings: {},
        },
      ]);

      await job.handle();

      expect(mockMessageQueueService.add).not.toHaveBeenCalled();
    });

    it('should not rebuild cache on cache hit', async () => {
      mockCacheStorageService.setMembers.mockResolvedValue([WORKSPACE_1]);
      mockCoreDataSource.query.mockResolvedValue([]);

      await job.handle();

      expect(mockCacheStorageService.setAdd).not.toHaveBeenCalled();
    });
  });

  describe('handle - cache miss', () => {
    it('should perform full scan when cache is empty', async () => {
      mockCacheStorageService.setMembers.mockResolvedValue([]);
      mockWorkspaceRepository.find.mockResolvedValue([
        { id: WORKSPACE_1 },
        { id: WORKSPACE_2 },
        { id: WORKSPACE_3 },
      ]);
      mockCoreDataSource.query.mockResolvedValue([]);

      await job.handle();

      expect(mockWorkspaceRepository.find).toHaveBeenCalled();
      expect(mockCoreDataSource.query).toHaveBeenCalledTimes(3);
    });

    it('should rebuild cache with workspaces that have cron triggers', async () => {
      mockCacheStorageService.setMembers.mockResolvedValue([]);
      mockWorkspaceRepository.find.mockResolvedValue([
        { id: WORKSPACE_1 },
        { id: WORKSPACE_2 },
        { id: WORKSPACE_3 },
      ]);

      mockCoreDataSource.query
        .mockResolvedValueOnce([
          {
            id: 'trigger-1',
            workflowId: 'workflow-1',
            settings: { pattern: '* * * * *' },
          },
        ])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: 'trigger-2',
            workflowId: 'workflow-2',
            settings: { pattern: '* * * * *' },
          },
        ]);

      await job.handle();

      expect(mockCacheStorageService.setAdd).toHaveBeenCalledWith(
        WORKFLOW_CRON_TRIGGER_CACHE_KEY,
        [WORKSPACE_1, WORKSPACE_3],
        WORKFLOW_CRON_TRIGGER_CACHE_TTL_MS,
      );
    });

    it('should not call setAdd when no workspaces have cron triggers', async () => {
      mockCacheStorageService.setMembers.mockResolvedValue([]);
      mockWorkspaceRepository.find.mockResolvedValue([
        { id: WORKSPACE_1 },
      ]);
      mockCoreDataSource.query.mockResolvedValue([]);

      await job.handle();

      expect(mockCacheStorageService.setAdd).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should catch errors per workspace and continue processing others', async () => {
      mockCacheStorageService.setMembers.mockResolvedValue([
        WORKSPACE_1,
        WORKSPACE_2,
      ]);
      mockCoreDataSource.query
        .mockRejectedValueOnce(new Error('Schema not found'))
        .mockResolvedValueOnce([
          {
            id: 'trigger-1',
            workflowId: 'workflow-1',
            settings: { pattern: '* * * * *' },
          },
        ]);

      await job.handle();

      expect(mockExceptionHandlerService.captureExceptions).toHaveBeenCalledWith(
        [expect.any(Error)],
        { workspace: { id: WORKSPACE_1 } },
      );
      expect(mockMessageQueueService.add).toHaveBeenCalledWith(
        WorkflowTriggerJob.name,
        {
          workspaceId: WORKSPACE_2,
          workflowId: 'workflow-1',
          payload: {},
        },
        { retryLimit: 3 },
      );
    });
  });
});
