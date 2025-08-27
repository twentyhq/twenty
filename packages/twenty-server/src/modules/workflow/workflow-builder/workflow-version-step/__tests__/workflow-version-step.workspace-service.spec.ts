import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

type MockWorkspaceRepository = Partial<
  WorkspaceRepository<WorkflowVersionWorkspaceEntity>
> & {
  findOne: jest.Mock;
  update: jest.Mock;
};

const mockWorkflowVersionId = 'workflow-version-id';
const mockWorkspaceId = 'workspace-id';

const mockSteps = [
  {
    id: 'step-1',
    type: WorkflowActionType.FORM,
    settings: {
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: false },
      },
    },
    nextStepIds: ['step-2'],
  },
  {
    id: 'step-2',
    type: WorkflowActionType.SEND_EMAIL,
    settings: {
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: false },
      },
    },
    nextStepIds: [],
  },
  {
    id: 'step-3',
    type: WorkflowActionType.SEND_EMAIL,
    settings: {
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: false },
      },
    },
    nextStepIds: [],
  },
] as WorkflowAction[];

const mockTrigger = {
  type: WorkflowTriggerType.MANUAL,
  settings: {},
  nextStepIds: ['step-1'],
};

const mockWorkflowVersion = {
  id: mockWorkflowVersionId,
  trigger: mockTrigger,
  steps: mockSteps,
  status: 'DRAFT',
} as WorkflowVersionWorkspaceEntity;

describe('WorkflowVersionStepWorkspaceService', () => {
  let twentyORMGlobalManager: jest.Mocked<TwentyORMGlobalManager>;
  let service: WorkflowVersionStepWorkspaceService;
  let mockWorkflowVersionWorkspaceRepository: MockWorkspaceRepository;

  beforeEach(async () => {
    mockWorkflowVersionWorkspaceRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    mockWorkflowVersionWorkspaceRepository.findOne.mockResolvedValue(
      mockWorkflowVersion,
    );

    twentyORMGlobalManager = {
      getRepositoryForWorkspace: jest
        .fn()
        .mockResolvedValue(mockWorkflowVersionWorkspaceRepository),
    } as unknown as jest.Mocked<TwentyORMGlobalManager>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowVersionStepWorkspaceService,
        {
          provide: TwentyORMGlobalManager,
          useValue: twentyORMGlobalManager,
        },
        {
          provide: WorkflowSchemaWorkspaceService,
          useValue: {
            computeStepOutputSchema: jest.fn(),
          },
        },
        { provide: ServerlessFunctionService, useValue: {} },
        {
          provide: getRepositoryToken(AgentEntity, 'core'),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        { provide: WorkflowRunWorkspaceService, useValue: {} },
        { provide: WorkflowRunnerWorkspaceService, useValue: {} },
        { provide: WorkflowCommonWorkspaceService, useValue: {} },
        { provide: ScopedWorkspaceContextFactory, useValue: {} },
      ],
    }).compile();

    service = module.get(WorkflowVersionStepWorkspaceService);
  });

  describe('createWorkflowVersionStep', () => {
    it('should create a step linked to trigger', async () => {
      const result = await service.createWorkflowVersionStep({
        input: {
          stepType: WorkflowActionType.FORM,
          parentStepId: TRIGGER_STEP_ID,
          nextStepId: undefined,
          workflowVersionId: mockWorkflowVersionId,
        },
        workspaceId: mockWorkspaceId,
      });

      expect(mockWorkflowVersionWorkspaceRepository.update).toHaveBeenCalled();

      expect(result.createdStep).toBeDefined();

      const createdStepId = result.createdStep?.id;

      expect(result.triggerNextStepIds).toEqual(['step-1', createdStepId]);
      expect(result.stepsNextStepIds).toEqual({
        'step-1': ['step-2'],
        'step-2': [],
        'step-3': [],
      });
    });

    it('should create a step between a trigger and a step', async () => {
      const result = await service.createWorkflowVersionStep({
        input: {
          stepType: WorkflowActionType.FORM,
          parentStepId: TRIGGER_STEP_ID,
          nextStepId: 'step-1',
          workflowVersionId: mockWorkflowVersionId,
        },
        workspaceId: mockWorkspaceId,
      });

      expect(mockWorkflowVersionWorkspaceRepository.update).toHaveBeenCalled();

      expect(result.createdStep).toBeDefined();

      const createdStepId = result.createdStep?.id as string;

      expect(result.triggerNextStepIds).toEqual([createdStepId]);
      expect(result.stepsNextStepIds).toEqual({
        [createdStepId]: ['step-1'],
        'step-1': ['step-2'],
        'step-2': [],
        'step-3': [],
      });
    });

    it('should create a step between two steps', async () => {
      const result = await service.createWorkflowVersionStep({
        input: {
          stepType: WorkflowActionType.FORM,
          parentStepId: 'step-1',
          nextStepId: 'step-2',
          workflowVersionId: mockWorkflowVersionId,
        },
        workspaceId: mockWorkspaceId,
      });

      expect(mockWorkflowVersionWorkspaceRepository.update).toHaveBeenCalled();

      expect(result.createdStep).toBeDefined();

      const createdStepId = result.createdStep?.id as string;

      expect(result.triggerNextStepIds).toEqual(['step-1']);
      expect(result.stepsNextStepIds).toEqual({
        'step-1': [createdStepId],
        [createdStepId]: ['step-2'],
        'step-2': [],
        'step-3': [],
      });
    });

    it('should create a step without parent or children', async () => {
      const result = await service.createWorkflowVersionStep({
        input: {
          stepType: WorkflowActionType.FORM,
          parentStepId: undefined,
          nextStepId: undefined,
          workflowVersionId: mockWorkflowVersionId,
        },
        workspaceId: mockWorkspaceId,
      });

      expect(mockWorkflowVersionWorkspaceRepository.update).toHaveBeenCalled();

      expect(result.createdStep).toBeDefined();

      expect(result.triggerNextStepIds).toEqual(['step-1']);
      expect(result.stepsNextStepIds).toEqual({
        'step-1': ['step-2'],
        'step-2': [],
        'step-3': [],
      });
    });
  });

  describe('deleteWorkflowVersionStep', () => {
    it('should delete step linked to trigger', async () => {
      const result = await service.deleteWorkflowVersionStep({
        stepIdToDelete: 'step-1',
        workflowVersionId: mockWorkflowVersionId,
        workspaceId: mockWorkspaceId,
      });

      expect(
        mockWorkflowVersionWorkspaceRepository.update,
      ).toHaveBeenCalledWith(mockWorkflowVersionId, {
        trigger: { ...mockTrigger, nextStepIds: ['step-2'] },
        steps: mockSteps.filter((step) => step.id !== 'step-1'),
      });

      expect(result).toEqual({
        triggerNextStepIds: ['step-2'],
        stepsNextStepIds: {
          'step-2': [],
          'step-3': [],
        },
        deletedStepIds: ['step-1'],
      });
    });

    it('should delete trigger', async () => {
      const result = await service.deleteWorkflowVersionStep({
        stepIdToDelete: TRIGGER_STEP_ID,
        workflowVersionId: mockWorkflowVersionId,
        workspaceId: mockWorkspaceId,
      });

      expect(
        mockWorkflowVersionWorkspaceRepository.update,
      ).toHaveBeenCalledWith(mockWorkflowVersionId, {
        trigger: null,
        steps: mockSteps,
      });

      expect(result).toEqual({
        stepsNextStepIds: {
          'step-1': ['step-2'],
          'step-2': [],
          'step-3': [],
        },
        deletedStepIds: [TRIGGER_STEP_ID],
      });
    });
  });
});
