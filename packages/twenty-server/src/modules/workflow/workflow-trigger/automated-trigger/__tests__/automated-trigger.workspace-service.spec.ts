import { Test, type TestingModule } from '@nestjs/testing';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { AutomatedTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.workspace-service';

const mockRepository = {
  insert: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
};

const mockGlobalWorkspaceOrmManager = {
  getRepository: jest.fn().mockResolvedValue(mockRepository),
  executeInWorkspaceContext: jest
    .fn()
    .mockImplementation((fn: () => any) => fn()),
};

describe('AutomatedTriggerWorkspaceService', () => {
  let service: AutomatedTriggerWorkspaceService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomatedTriggerWorkspaceService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: mockGlobalWorkspaceOrmManager,
        },
      ],
    }).compile();

    service = module.get<AutomatedTriggerWorkspaceService>(
      AutomatedTriggerWorkspaceService,
    );
  });

  describe('addAutomatedTrigger', () => {
    const workspaceId = 'workspace-1';
    const workflowId = 'workflow-1';
    const cronSettings = { pattern: '* * * * *' };
    const databaseEventSettings = {
      eventName: 'company.created',
      fields: [],
    };

    it('should insert a CRON trigger', async () => {
      await service.addAutomatedTrigger({
        workflowId,
        type: AutomatedTriggerType.CRON,
        settings: cronSettings,
        workspaceId,
      });

      expect(mockRepository.insert).toHaveBeenCalledWith({
        type: AutomatedTriggerType.CRON,
        settings: cronSettings,
        workflowId,
      });
    });

    it('should insert a DATABASE_EVENT trigger', async () => {
      await service.addAutomatedTrigger({
        workflowId,
        type: AutomatedTriggerType.DATABASE_EVENT,
        settings: databaseEventSettings,
        workspaceId,
      });

      expect(mockRepository.insert).toHaveBeenCalledWith({
        type: AutomatedTriggerType.DATABASE_EVENT,
        settings: databaseEventSettings,
        workflowId,
      });
    });

    it('should use entityManager when provided', async () => {
      const mockEntityManager = {} as any;

      await service.addAutomatedTrigger({
        workflowId,
        type: AutomatedTriggerType.CRON,
        settings: cronSettings,
        workspaceId,
        entityManager: mockEntityManager,
      });

      expect(mockRepository.insert).toHaveBeenCalledWith(
        { type: AutomatedTriggerType.CRON, settings: cronSettings, workflowId },
        mockEntityManager,
      );
      expect(
        mockGlobalWorkspaceOrmManager.executeInWorkspaceContext,
      ).not.toHaveBeenCalled();
    });

    it('should use executeInWorkspaceContext when no entityManager provided', async () => {
      await service.addAutomatedTrigger({
        workflowId,
        type: AutomatedTriggerType.CRON,
        settings: cronSettings,
        workspaceId,
      });

      expect(
        mockGlobalWorkspaceOrmManager.executeInWorkspaceContext,
      ).toHaveBeenCalled();
    });
  });

  describe('deleteAutomatedTrigger', () => {
    const workspaceId = 'workspace-1';
    const workflowId = 'workflow-1';

    it('should delete trigger by workflowId', async () => {
      await service.deleteAutomatedTrigger({
        workflowId,
        workspaceId,
      });

      expect(mockRepository.delete).toHaveBeenCalledWith({ workflowId });
    });

    it('should use entityManager when provided', async () => {
      const mockEntityManager = {} as any;

      await service.deleteAutomatedTrigger({
        workflowId,
        workspaceId,
        entityManager: mockEntityManager,
      });

      expect(mockRepository.delete).toHaveBeenCalledWith(
        { workflowId },
        mockEntityManager,
      );
      expect(
        mockGlobalWorkspaceOrmManager.executeInWorkspaceContext,
      ).not.toHaveBeenCalled();
    });
  });
});
