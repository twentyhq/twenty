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
  hashGetValues: jest.fn(),
  hashSet: jest.fn(),
  expire: jest.fn(),
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
    it('should process cached triggers without querying the database', async () => {
      mockCacheStorageService.hashGetValues.mockResolvedValue([
        JSON.stringify({
          workspaceId: WORKSPACE_1,
          workflowId: 'workflow-1',
          pattern: '* * * * *',
        }),
      ]);

      await job.handle();

      expect(mockCacheStorageService.hashGetValues).toHaveBeenCalledWith(
        WORKFLOW_CRON_TRIGGER_CACHE_KEY,
      );
      expect(mockWorkspaceRepository.find).not.toHaveBeenCalled();
      expect(mockCoreDataSource.query).not.toHaveBeenCalled();
    });

    it('should enqueue jobs for matching cron triggers', async () => {
      mockCacheStorageService.hashGetValues.mockResolvedValue([
        JSON.stringify({
          workspaceId: WORKSPACE_1,
          workflowId: 'workflow-1',
          pattern: '* * * * *',
        }),
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
      mockCacheStorageService.hashGetValues.mockResolvedValue([
        JSON.stringify({
          workspaceId: WORKSPACE_1,
          workflowId: 'workflow-1',
          pattern: '0 0 1 1 *',
        }),
      ]);

      await job.handle();

      expect(mockMessageQueueService.add).not.toHaveBeenCalled();
    });

    it('should skip triggers with undefined pattern', async () => {
      mockCacheStorageService.hashGetValues.mockResolvedValue([
        JSON.stringify({
          workspaceId: WORKSPACE_1,
          workflowId: 'workflow-1',
        }),
      ]);

      await job.handle();

      expect(mockMessageQueueService.add).not.toHaveBeenCalled();
    });

    it('should not rebuild cache on cache hit', async () => {
      mockCacheStorageService.hashGetValues.mockResolvedValue([
        JSON.stringify({
          workspaceId: WORKSPACE_1,
          workflowId: 'workflow-1',
          pattern: '* * * * *',
        }),
      ]);

      await job.handle();

      expect(mockCacheStorageService.hashSet).not.toHaveBeenCalled();
    });
  });

  describe('handle - cache miss', () => {
    it('should perform full scan when cache is empty', async () => {
      mockCacheStorageService.hashGetValues.mockResolvedValue([]);
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

    it('should write each trigger to cache immediately and set TTL', async () => {
      mockCacheStorageService.hashGetValues.mockResolvedValue([]);
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

      expect(mockCacheStorageService.hashSet).toHaveBeenCalledTimes(2);
      expect(mockCacheStorageService.hashSet).toHaveBeenCalledWith({
        key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
        field: 'workflow-1',
        value: JSON.stringify({
          workspaceId: WORKSPACE_1,
          workflowId: 'workflow-1',
          pattern: '* * * * *',
        }),
      });
      expect(mockCacheStorageService.hashSet).toHaveBeenCalledWith({
        key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
        field: 'workflow-2',
        value: JSON.stringify({
          workspaceId: WORKSPACE_3,
          workflowId: 'workflow-2',
          pattern: '* * * * *',
        }),
      });
      expect(mockCacheStorageService.expire).toHaveBeenCalledWith(
        WORKFLOW_CRON_TRIGGER_CACHE_KEY,
        WORKFLOW_CRON_TRIGGER_CACHE_TTL_MS,
      );
    });

    it('should not write to cache when no workspaces have cron triggers', async () => {
      mockCacheStorageService.hashGetValues.mockResolvedValue([]);
      mockWorkspaceRepository.find.mockResolvedValue([{ id: WORKSPACE_1 }]);
      mockCoreDataSource.query.mockResolvedValue([]);

      await job.handle();

      expect(mockCacheStorageService.hashSet).not.toHaveBeenCalled();
      expect(mockCacheStorageService.expire).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should catch errors for cached triggers and continue processing', async () => {
      mockCacheStorageService.hashGetValues.mockResolvedValue([
        'invalid-json',
        JSON.stringify({
          workspaceId: WORKSPACE_2,
          workflowId: 'workflow-1',
          pattern: '* * * * *',
        }),
      ]);

      await job.handle();

      expect(
        mockExceptionHandlerService.captureExceptions,
      ).toHaveBeenCalledWith([expect.any(Error)]);
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

    it('should catch errors per workspace during full scan and continue', async () => {
      mockCacheStorageService.hashGetValues.mockResolvedValue([]);
      mockWorkspaceRepository.find.mockResolvedValue([
        { id: WORKSPACE_1 },
        { id: WORKSPACE_2 },
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

      expect(
        mockExceptionHandlerService.captureExceptions,
      ).toHaveBeenCalledWith([expect.any(Error)], {
        workspace: { id: WORKSPACE_1 },
      });
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
