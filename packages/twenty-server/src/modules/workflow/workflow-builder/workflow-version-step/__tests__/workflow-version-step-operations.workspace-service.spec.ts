import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const mockWorkspaceId = 'workspace-id';

describe('WorkflowVersionStepOperationsWorkspaceService', () => {
  let service: WorkflowVersionStepOperationsWorkspaceService;
  let globalWorkspaceOrmManager: jest.Mocked<GlobalWorkspaceOrmManager>;
  let logicFunctionFromSourceService: jest.Mocked<LogicFunctionFromSourceService>;
  let codeStepBuildService: jest.Mocked<CodeStepBuildService>;
  let agentService: jest.Mocked<AgentService>;
  let roleTargetRepository: jest.Mocked<any>;
  let objectMetadataRepository: jest.Mocked<any>;
  let workflowCommonWorkspaceService: jest.Mocked<WorkflowCommonWorkspaceService>;
  let aiAgentRoleService: jest.Mocked<AiAgentRoleService>;
  let workspaceCacheService: jest.Mocked<WorkspaceCacheService>;

  beforeEach(async () => {
    codeStepBuildService = {
      seedCodeStepFiles: jest.fn().mockResolvedValue({
        sourceHandlerPath: 'workflow/logic-fn-id/src/index.ts',
        builtHandlerPath: 'workflow/logic-fn-id/src/index.mjs',
        checksum: 'seed-checksum',
      }),
      createCodeStepLogicFunction: jest.fn().mockResolvedValue({
        id: 'new-function-id',
        name: 'Test Function',
        description: 'Test Description',
        workspaceId: mockWorkspaceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        runtime: LogicFunctionRuntime.NODE22,
        timeoutSeconds: 30,
        sourceHandlerPath: 'src/index.ts',
        builtHandlerPath: 'index.mjs',
        handlerName: 'main',
        checksum: null,
        toolInputSchema: null,
        isTool: false,
        universalIdentifier: 'universal-id',
        applicationId: 'application-id',
        cronTriggerSettings: null,
        databaseEventTriggerSettings: null,
        httpRouteTriggerSettings: null,
      }),
      copySourceAndBuiltForNewCodeStep: jest.fn().mockResolvedValue(undefined),
      duplicateCodeStepLogicFunction: jest.fn().mockResolvedValue({
        id: 'new-function-id',
        name: 'Test Function',
        description: 'Test Description',
        workspaceId: mockWorkspaceId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        runtime: LogicFunctionRuntime.NODE22,
        timeoutSeconds: 30,
        sourceHandlerPath: 'src/index.ts',
        builtHandlerPath: 'index.mjs',
        handlerName: 'main',
        checksum: null,
        toolInputSchema: null,
        isTool: false,
        universalIdentifier: 'universal-id',
        applicationId: 'application-id',
        cronTriggerSettings: null,
        databaseEventTriggerSettings: null,
        httpRouteTriggerSettings: null,
      }),
    } as unknown as jest.Mocked<CodeStepBuildService>;

    logicFunctionFromSourceService = {
      deleteOneWithSource: jest.fn(),
    } as unknown as jest.Mocked<LogicFunctionFromSourceService>;

    agentService = {
      deleteManyAgents: jest.fn().mockResolvedValue([]),
      findOneAgentById: jest.fn(),
      createOneAgent: jest.fn(),
    } as unknown as jest.Mocked<AgentService>;

    roleTargetRepository = {
      findOne: jest.fn(),
      count: jest.fn(),
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
          provide: LogicFunctionFromSourceService,
          useValue: logicFunctionFromSourceService,
        },
        {
          provide: CodeStepBuildService,
          useValue: codeStepBuildService,
        },
        {
          provide: AgentService,
          useValue: agentService,
        },
        {
          provide: getRepositoryToken(RoleTargetEntity),
          useValue: roleTargetRepository,
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
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            flushFlatEntityMaps: jest.fn(),
            getOrRecomputeManyOrAllFlatEntityMaps: jest
              .fn()
              .mockResolvedValue(createEmptyAllFlatEntityMaps()),
          },
        },
      ],
    }).compile();

    service = module.get(WorkflowVersionStepOperationsWorkspaceService);
  });

  describe('runWorkflowVersionStepDeletionSideEffects', () => {
    it('should delete logic function when deleting code step', async () => {
      const step = {
        id: 'step-id',
        name: 'Code Step',
        type: WorkflowActionType.CODE,
        valid: true,
        nextStepIds: [],
        settings: {
          input: {
            logicFunctionId: 'function-id',
          },
          outputSchema: {},
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
        },
      } as unknown as WorkflowAction;

      await service.runWorkflowVersionStepDeletionSideEffects({
        step,
        workspaceId: mockWorkspaceId,
      });

      expect(
        logicFunctionFromSourceService.deleteOneWithSource,
      ).toHaveBeenCalledWith({
        id: 'function-id',
        workspaceId: mockWorkspaceId,
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

      await service.runWorkflowVersionStepDeletionSideEffects({
        step,
        workspaceId: mockWorkspaceId,
      });

      expect(agentService.deleteManyAgents).toHaveBeenCalledWith({
        ids: ['agent-id'],
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

      roleTargetRepository.findOne.mockResolvedValue({
        id: 'role-target-id',
        roleId: 'role-id',
      });

      await service.runWorkflowVersionStepDeletionSideEffects({
        step,
        workspaceId: mockWorkspaceId,
      });

      expect(agentService.deleteManyAgents).toHaveBeenCalledWith({
        ids: ['agent-id'],
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
    it('should create code step with logic function', async () => {
      const result = await service.runStepCreationSideEffectsAndBuildStep({
        type: WorkflowActionType.CODE,
        workspaceId: mockWorkspaceId,
        workflowVersionId: 'workflow-version-id',
      });

      expect(result.builtStep.type).toBe(WorkflowActionType.CODE);
      const codeResult = result.builtStep as unknown as {
        settings: {
          input: {
            logicFunctionId: string;
          };
        };
      };

      expect(codeResult.settings.input.logicFunctionId).toBe('new-function-id');
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
    it('should duplicate code step with new logic function', async () => {
      const originalStep = {
        id: 'original-id',
        type: WorkflowActionType.CODE,
        name: 'Original Step',
        valid: true,
        settings: {
          input: {
            logicFunctionId: 'function-id',
          },
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
      const codeResult = duplicateStep as unknown as {
        settings: {
          input: {
            logicFunctionId: string;
          };
        };
      };

      expect(codeResult.settings.input.logicFunctionId).toBe('new-function-id');

      expect(duplicateStep.nextStepIds).toEqual([]);
      expect(
        codeStepBuildService.duplicateCodeStepLogicFunction,
      ).toHaveBeenCalledWith({
        existingLogicFunctionId: 'function-id',
        workspaceId: mockWorkspaceId,
      });
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
