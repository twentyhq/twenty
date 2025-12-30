import { Test, type TestingModule } from '@nestjs/testing';

import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { WorkflowVersionStepCreationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-creation.workspace-service';
import { WorkflowVersionStepDeletionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-deletion.workspace-service';
import { WorkflowVersionStepHelpersWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-helpers.workspace-service';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { WorkflowVersionStepUpdateWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-update.workspace-service';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

jest.mock(
  'src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util',
  () => ({
    computeWorkflowVersionStepChanges: jest.fn(),
  }),
);

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
  let globalWorkspaceOrmManager: jest.Mocked<GlobalWorkspaceOrmManager>;
  let service: WorkflowVersionStepWorkspaceService;
  let mockWorkflowVersionWorkspaceRepository: MockWorkspaceRepository;
  let mockComputeWorkflowVersionStepChanges: jest.Mock;

  beforeEach(async () => {
    const {
      computeWorkflowVersionStepChanges,
    } = require('src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util');

    mockComputeWorkflowVersionStepChanges =
      computeWorkflowVersionStepChanges as jest.Mock;

    mockWorkflowVersionWorkspaceRepository = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    mockWorkflowVersionWorkspaceRepository.findOne.mockResolvedValue(
      mockWorkflowVersion,
    );

    globalWorkspaceOrmManager = {
      getRepository: jest
        .fn()
        .mockResolvedValue(mockWorkflowVersionWorkspaceRepository),
      executeInWorkspaceContext: jest
        .fn()

        .mockImplementation((_authContext: any, fn: () => any) => fn()),
    } as unknown as jest.Mocked<GlobalWorkspaceOrmManager>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowVersionStepWorkspaceService,
        WorkflowVersionStepHelpersWorkspaceService,
        WorkflowVersionStepCreationWorkspaceService,
        WorkflowVersionStepUpdateWorkspaceService,
        WorkflowVersionStepDeletionWorkspaceService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: globalWorkspaceOrmManager,
        },
        {
          provide: WorkflowSchemaWorkspaceService,
          useValue: {
            enrichOutputSchema: jest
              .fn()
              .mockImplementation((args) => args.step),
          },
        },
        {
          provide: WorkflowVersionStepOperationsWorkspaceService,
          useValue: {
            runStepCreationSideEffectsAndBuildStep: jest
              .fn()
              .mockImplementation(({ type }) => ({
                builtStep: {
                  id: 'new-step-id',
                  type,
                  settings: {},
                  nextStepIds: [],
                },
                additionalCreatedSteps: [],
              })),
            runWorkflowVersionStepDeletionSideEffects: jest.fn(),
            cloneStep: jest.fn().mockImplementation(({ step }) => ({
              ...step,
              id: 'cloned-step-id',
            })),
            markStepAsDuplicate: jest
              .fn()
              .mockImplementation(({ step }) => step),
            createDraftStep: jest.fn().mockImplementation(({ step }) => step),
          },
        },
        {
          provide: WorkflowCommonWorkspaceService,
          useValue: {
            getWorkflowVersionOrFail: jest
              .fn()
              .mockResolvedValue(mockWorkflowVersion),
          },
        },
      ],
    }).compile();

    service = module.get(WorkflowVersionStepWorkspaceService);
  });

  describe('createWorkflowVersionStep', () => {
    it('should create a step linked to trigger', async () => {
      const mockChanges = {
        triggerDiff: [
          {
            type: 'CHANGE',
            path: ['nextStepIds'],
            value: ['step-1', 'new-step-id'],
          },
        ],
        stepsDiff: [
          {
            type: 'CREATE',
            path: [],
            value: { id: 'new-step-id', type: 'FORM' },
          },
        ],
      };

      mockComputeWorkflowVersionStepChanges.mockReturnValue(mockChanges);

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
      expect(mockComputeWorkflowVersionStepChanges).toHaveBeenCalled();

      expect(result).toEqual(mockChanges);
      expect(result.triggerDiff).toBeDefined();
      expect(result.stepsDiff).toBeDefined();
    });

    it('should create a step between a trigger and a step', async () => {
      const mockChanges = {
        triggerDiff: [
          { type: 'CHANGE', path: ['nextStepIds'], value: ['new-step-id'] },
        ],
        stepsDiff: [
          {
            type: 'CREATE',
            path: [],
            value: {
              id: 'new-step-id',
              type: 'FORM',
              nextStepIds: ['step-1'],
            },
          },
        ],
      };

      mockComputeWorkflowVersionStepChanges.mockReturnValue(mockChanges);

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
      expect(mockComputeWorkflowVersionStepChanges).toHaveBeenCalled();

      expect(result).toEqual(mockChanges);
      expect(result.triggerDiff).toBeDefined();
      expect(result.stepsDiff).toBeDefined();
    });

    it('should create a step between two steps', async () => {
      const mockChanges = {
        triggerDiff: [],
        stepsDiff: [
          { type: 'CHANGE', path: [0, 'nextStepIds'], value: ['new-step-id'] },
          {
            type: 'CREATE',
            path: [],
            value: {
              id: 'new-step-id',
              type: 'FORM',
              nextStepIds: ['step-2'],
            },
          },
        ],
      };

      mockComputeWorkflowVersionStepChanges.mockReturnValue(mockChanges);

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
      expect(mockComputeWorkflowVersionStepChanges).toHaveBeenCalled();

      expect(result).toEqual(mockChanges);
      expect(result.triggerDiff).toBeDefined();
      expect(result.stepsDiff).toBeDefined();
    });

    it('should create a step without parent or children', async () => {
      const mockChanges = {
        triggerDiff: [],
        stepsDiff: [
          {
            type: 'CREATE',
            path: [],
            value: { id: 'new-step-id', type: 'FORM' },
          },
        ],
      };

      mockComputeWorkflowVersionStepChanges.mockReturnValue(mockChanges);

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
      expect(mockComputeWorkflowVersionStepChanges).toHaveBeenCalled();

      expect(result).toEqual(mockChanges);
      expect(result.triggerDiff).toBeDefined();
      expect(result.stepsDiff).toBeDefined();
    });
  });

  describe('deleteWorkflowVersionStep', () => {
    it('should delete step linked to trigger', async () => {
      const mockChanges = {
        triggerDiff: [
          { type: 'CHANGE', path: ['nextStepIds'], value: ['step-2'] },
        ],
        stepsDiff: [{ type: 'REMOVE', path: [0] }],
      };

      mockComputeWorkflowVersionStepChanges.mockReturnValue(mockChanges);

      const result = await service.deleteWorkflowVersionStep({
        stepIdToDelete: 'step-1',
        workflowVersionId: mockWorkflowVersionId,
        workspaceId: mockWorkspaceId,
      });

      expect(mockWorkflowVersionWorkspaceRepository.update).toHaveBeenCalled();
      expect(mockComputeWorkflowVersionStepChanges).toHaveBeenCalled();

      expect(result).toEqual(mockChanges);
      expect(result.triggerDiff).toBeDefined();
      expect(result.stepsDiff).toBeDefined();
    });

    it('should delete trigger', async () => {
      const mockChanges = {
        triggerDiff: [{ type: 'REMOVE', path: [] }],
        stepsDiff: [],
      };

      mockComputeWorkflowVersionStepChanges.mockReturnValue(mockChanges);

      const result = await service.deleteWorkflowVersionStep({
        stepIdToDelete: TRIGGER_STEP_ID,
        workflowVersionId: mockWorkflowVersionId,
        workspaceId: mockWorkspaceId,
      });

      expect(mockWorkflowVersionWorkspaceRepository.update).toHaveBeenCalled();
      expect(mockComputeWorkflowVersionStepChanges).toHaveBeenCalled();

      expect(result).toEqual(mockChanges);
      expect(result.triggerDiff).toBeDefined();
      expect(result.stepsDiff).toBeDefined();
    });
  });
});
