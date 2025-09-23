import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const mockWorkspaceId = 'workspace-id';

describe('WorkflowVersionStepOperationsWorkspaceService', () => {
  let service: WorkflowVersionStepOperationsWorkspaceService;
  let twentyORMGlobalManager: jest.Mocked<TwentyORMGlobalManager>;
  let serverlessFunctionService: jest.Mocked<ServerlessFunctionService>;
  let agentRepository: jest.Mocked<any>;
  let objectMetadataRepository: jest.Mocked<any>;
  let workflowCommonWorkspaceService: jest.Mocked<WorkflowCommonWorkspaceService>;

  beforeEach(async () => {
    serverlessFunctionService = {
      createOneServerlessFunction: jest.fn(),
      hasServerlessFunctionPublishedVersion: jest.fn(),
      deleteOneServerlessFunction: jest.fn(),
      duplicateServerlessFunction: jest.fn(),
      createDraftFromPublishedVersion: jest.fn(),
    } as unknown as jest.Mocked<ServerlessFunctionService>;

    agentRepository = {
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    objectMetadataRepository = {
      findOne: jest.fn(),
    };

    workflowCommonWorkspaceService = {
      getObjectMetadataItemWithFieldsMaps: jest.fn(),
    } as unknown as jest.Mocked<WorkflowCommonWorkspaceService>;

    twentyORMGlobalManager = {
      getRepositoryForWorkspace: jest.fn(),
    } as unknown as jest.Mocked<TwentyORMGlobalManager>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowVersionStepOperationsWorkspaceService,
        {
          provide: TwentyORMGlobalManager,
          useValue: twentyORMGlobalManager,
        },
        {
          provide: ServerlessFunctionService,
          useValue: serverlessFunctionService,
        },
        {
          provide: getRepositoryToken(AgentEntity),
          useValue: agentRepository,
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity),
          useValue: objectMetadataRepository,
        },
        {
          provide: WorkflowCommonWorkspaceService,
          useValue: workflowCommonWorkspaceService,
        },
        {
          provide: ScopedWorkspaceContextFactory,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get(WorkflowVersionStepOperationsWorkspaceService);
  });

  describe('runWorkflowVersionStepDeletionSideEffects', () => {
    it('should delete serverless function when deleting code step', async () => {
      const step = {
        id: 'step-id',
        name: 'Code Step',
        type: WorkflowActionType.CODE,
        valid: true,
        nextStepIds: [],
        settings: {
          input: {
            serverlessFunctionId: 'function-id',
            serverlessFunctionVersion: 'v1',
          },
          outputSchema: {},
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
        },
      } as unknown as WorkflowAction;

      serverlessFunctionService.hasServerlessFunctionPublishedVersion.mockResolvedValue(
        false,
      );

      await service.runWorkflowVersionStepDeletionSideEffects({
        step,
        workspaceId: mockWorkspaceId,
      });

      expect(
        serverlessFunctionService.deleteOneServerlessFunction,
      ).toHaveBeenCalledWith({
        id: 'function-id',
        workspaceId: mockWorkspaceId,
        softDelete: false,
      });
    });

    it('should delete agent when deleting AI agent step', async () => {
      const step = {
        id: 'step-id',
        name: 'AI Agent Step',
        type: WorkflowActionType.AI_AGENT,
        valid: true,
        nextStepIds: [],
        settings: {
          input: {
            agentId: 'agent-id',
            prompt: '',
          },
          outputSchema: {},
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
        },
      } as unknown as WorkflowAction;

      agentRepository.findOne.mockResolvedValue({ id: 'agent-id' });

      await service.runWorkflowVersionStepDeletionSideEffects({
        step,
        workspaceId: mockWorkspaceId,
      });

      expect(agentRepository.delete).toHaveBeenCalledWith({
        id: 'agent-id',
        workspaceId: mockWorkspaceId,
      });
    });
  });

  describe('runStepCreationSideEffectsAndBuildStep', () => {
    it('should create code step with serverless function', async () => {
      const mockServerlessFunction = {
        id: 'new-function-id',
        name: 'Test Function',
        description: 'Test Description',
        latestVersion: 'v1',
        publishedVersions: [],
        workspaceId: mockWorkspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isActive: true,
        isSystem: false,
        isCustom: true,
        isPublic: false,
        latestVersionInputSchema: {},
        runtime: 'nodejs',
        timeoutSeconds: 30,
        layerVersion: 1,
        layerArn: '',
        layerName: '',
        layerSize: 0,
      } as unknown as ServerlessFunctionEntity;

      serverlessFunctionService.createOneServerlessFunction.mockResolvedValue(
        mockServerlessFunction,
      );

      const result = await service.runStepCreationSideEffectsAndBuildStep({
        type: WorkflowActionType.CODE,
        workspaceId: mockWorkspaceId,
        workflowVersionId: 'workflow-version-id',
      });

      expect(result.type).toBe(WorkflowActionType.CODE);
      const codeResult = result as unknown as {
        settings: {
          input: {
            serverlessFunctionId: string;
            serverlessFunctionVersion: string;
          };
        };
      };

      expect(codeResult.settings.input.serverlessFunctionId).toBe(
        'new-function-id',
      );
      expect(codeResult.settings.input.serverlessFunctionVersion).toBe('draft');
    });

    it('should create form step', async () => {
      const result = await service.runStepCreationSideEffectsAndBuildStep({
        type: WorkflowActionType.FORM,
        workspaceId: mockWorkspaceId,
        workflowVersionId: 'workflow-version-id',
      });

      expect(result.type).toBe(WorkflowActionType.FORM);
      expect(result.settings.input).toEqual([]);
    });
  });

  describe('createStepForDuplicate', () => {
    it('should duplicate code step with new serverless function', async () => {
      const originalStep = {
        id: 'original-id',
        type: WorkflowActionType.CODE,
        name: 'Original Step',
        valid: true,
        settings: {
          input: {
            serverlessFunctionId: 'function-id',
            serverlessFunctionVersion: 'v1',
          },
        },
        nextStepIds: ['next-step'],
      } as unknown as WorkflowAction;

      const mockNewServerlessFunction = {
        id: 'new-function-id',
        name: 'Test Function',
        description: 'Test Description',
        latestVersion: 'v1',
        publishedVersions: [],
        workspaceId: mockWorkspaceId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        isActive: true,
        isSystem: false,
        isCustom: true,
        isPublic: false,
        latestVersionInputSchema: {},
        runtime: 'nodejs',
        timeoutSeconds: 30,
        layerVersion: 1,
        layerArn: '',
        layerName: '',
        layerSize: 0,
      } as unknown as ServerlessFunctionEntity;

      serverlessFunctionService.duplicateServerlessFunction.mockResolvedValue(
        mockNewServerlessFunction,
      );

      const result = await service.createStepForDuplicate({
        step: originalStep,
        workspaceId: mockWorkspaceId,
      });

      expect(result.id).not.toBe('original-id');
      expect(result.name).toBe('Original Step (Duplicate)');
      const codeResult = result as unknown as {
        settings: {
          input: {
            serverlessFunctionId: string;
            serverlessFunctionVersion: string;
          };
        };
      };

      expect(codeResult.settings.input.serverlessFunctionId).toBe(
        'new-function-id',
      );
      expect(codeResult.settings.input.serverlessFunctionVersion).toBe('draft');

      expect(result.nextStepIds).toEqual([]);
    });

    it('should duplicate non-code step', async () => {
      const originalStep = {
        id: 'original-id',
        type: WorkflowActionType.FORM,
        name: 'Original Step',
        valid: true,
        settings: {
          input: [],
        },
        nextStepIds: ['next-step'],
      } as unknown as WorkflowAction;

      const result = await service.createStepForDuplicate({
        step: originalStep,
        workspaceId: mockWorkspaceId,
      });

      expect(result.id).not.toBe('original-id');
      expect(result.name).toBe('Original Step (Duplicate)');
      expect(result.settings).toEqual(originalStep.settings);
      expect(result.nextStepIds).toEqual([]);
    });
  });
});
