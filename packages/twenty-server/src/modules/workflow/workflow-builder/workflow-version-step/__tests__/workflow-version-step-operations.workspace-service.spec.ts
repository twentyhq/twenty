import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const mockWorkspaceId = 'workspace-id';

describe('WorkflowVersionStepOperationsWorkspaceService', () => {
  let service: WorkflowVersionStepOperationsWorkspaceService;
  let globalWorkspaceOrmManager: jest.Mocked<GlobalWorkspaceOrmManager>;
  let serverlessFunctionService: jest.Mocked<ServerlessFunctionService>;
  let agentRepository: jest.Mocked<any>;
  let roleTargetRepository: jest.Mocked<any>;
  let roleRepository: jest.Mocked<any>;
  let objectMetadataRepository: jest.Mocked<any>;
  let workflowCommonWorkspaceService: jest.Mocked<WorkflowCommonWorkspaceService>;
  let aiAgentRoleService: jest.Mocked<AiAgentRoleService>;
  let workspaceCacheService: jest.Mocked<WorkspaceCacheService>;

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

    roleTargetRepository = {
      findOne: jest.fn(),
      count: jest.fn(),
    };

    roleRepository = {
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    objectMetadataRepository = {
      findOne: jest.fn(),
    };

    workflowCommonWorkspaceService = {
      getObjectMetadataItemWithFieldsMaps: jest.fn(),
    } as unknown as jest.Mocked<WorkflowCommonWorkspaceService>;

    aiAgentRoleService = {
      deleteAgentOnlyRoleIfUnused: jest.fn(),
    } as unknown as jest.Mocked<AiAgentRoleService>;

    globalWorkspaceOrmManager = {
      getRepository: jest.fn(),
    } as unknown as jest.Mocked<GlobalWorkspaceOrmManager>;
    workspaceCacheService = {
      flush: jest.fn(),
    } as unknown as jest.Mocked<WorkspaceCacheService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowVersionStepOperationsWorkspaceService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: globalWorkspaceOrmManager,
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
          provide: getRepositoryToken(RoleTargetEntity),
          useValue: roleTargetRepository,
        },
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: roleRepository,
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
          provide: AiAgentRoleService,
          useValue: aiAgentRoleService,
        },
        {
          provide: WorkspaceCacheService,
          useValue: workspaceCacheService,
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

    it('should delete attached role when it is agent-only and unassigned elsewhere', async () => {
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
      roleTargetRepository.findOne.mockResolvedValue({
        id: 'role-target-id',
        roleId: 'role-id',
      });

      await service.runWorkflowVersionStepDeletionSideEffects({
        step,
        workspaceId: mockWorkspaceId,
      });

      expect(agentRepository.delete).toHaveBeenCalledWith({
        id: 'agent-id',
        workspaceId: mockWorkspaceId,
      });
      expect(
        aiAgentRoleService.deleteAgentOnlyRoleIfUnused,
      ).toHaveBeenCalledWith({
        roleId: 'role-id',
        roleTargetId: 'role-target-id',
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
        runtime: 'nodejs',
        timeoutSeconds: 30,
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

      expect(result.builtStep.type).toBe(WorkflowActionType.CODE);
      const codeResult = result.builtStep as unknown as {
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

      expect(result.builtStep.type).toBe(WorkflowActionType.FORM);
      expect(result.builtStep.settings.input).toEqual([]);
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
        runtime: 'nodejs',
        timeoutSeconds: 30,
        layerArn: '',
        layerName: '',
        layerSize: 0,
      } as unknown as ServerlessFunctionEntity;

      serverlessFunctionService.duplicateServerlessFunction.mockResolvedValue(
        mockNewServerlessFunction,
      );

      const clonedStep = await service.cloneStep({
        step: originalStep,
        workspaceId: mockWorkspaceId,
      });
      const duplicateStep = service.markStepAsDuplicate({
        step: clonedStep,
      });

      expect(duplicateStep.id).not.toBe('original-id');
      expect(duplicateStep.name).toBe('Original Step (Duplicate)');
      const codeResult = duplicateStep as unknown as {
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

      expect(duplicateStep.nextStepIds).toEqual([]);
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

      const clonedStep = await service.cloneStep({
        step: originalStep,
        workspaceId: mockWorkspaceId,
      });
      const duplicateStep = service.markStepAsDuplicate({
        step: clonedStep,
      });

      expect(duplicateStep.id).not.toBe('original-id');
      expect(duplicateStep.name).toBe('Original Step (Duplicate)');
      expect(duplicateStep.settings).toEqual(originalStep.settings);
      expect(duplicateStep.nextStepIds).toEqual([]);
    });

    it('should duplicate iterator step with cleared initialLoopStepIds', async () => {
      const originalStep = {
        id: 'original-iterator-id',
        type: WorkflowActionType.ITERATOR,
        name: 'Iterator Step',
        valid: true,
        position: { x: 100, y: 200 },
        settings: {
          input: {
            items: ['item1', 'item2', 'item3'],
            initialLoopStepIds: ['loop-step-1', 'loop-step-2'],
          },
          outputSchema: {},
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
        },
        nextStepIds: ['next-step'],
      } as unknown as WorkflowAction;

      const clonedStep = await service.cloneStep({
        step: originalStep,
        workspaceId: mockWorkspaceId,
      });

      expect(clonedStep.id).not.toBe('original-iterator-id');
      expect(clonedStep.type).toBe(WorkflowActionType.ITERATOR);
      expect(clonedStep.nextStepIds).toEqual([]);
      expect(clonedStep.position).toEqual({ x: 100, y: 200 });

      const iteratorResult = clonedStep as unknown as {
        settings: {
          input: {
            items: string[];
            initialLoopStepIds: string[];
          };
        };
      };

      expect(iteratorResult.settings.input.items).toEqual([
        'item1',
        'item2',
        'item3',
      ]);

      expect(iteratorResult.settings.input.initialLoopStepIds).toEqual([]);
    });
  });
});
