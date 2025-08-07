import { Test, TestingModule } from '@nestjs/testing';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowVersionEdgeWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-edge/workflow-version-edge.workspace-service';

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

describe('WorkflowVersionEdgeWorkspaceService', () => {
  let twentyORMGlobalManager: jest.Mocked<TwentyORMGlobalManager>;
  let service: WorkflowVersionEdgeWorkspaceService;
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
        WorkflowVersionEdgeWorkspaceService,
        {
          provide: TwentyORMGlobalManager,
          useValue: twentyORMGlobalManager,
        },
      ],
    }).compile();

    service = module.get(WorkflowVersionEdgeWorkspaceService);
  });

  describe('createWorkflowVersionEdge', () => {
    it('should throw if target does not exists', async () => {
      const call = async () =>
        await service.createWorkflowVersionEdge({
          source: 'trigger',
          target: 'not-existing-step',
          workflowVersionId: mockWorkflowVersionId,
          workspaceId: mockWorkspaceId,
        });

      await expect(call).rejects.toThrow(
        `Target step 'not-existing-step' not found in workflowVersion '${mockWorkflowVersionId}'`,
      );
    });

    describe('with source is the trigger', () => {
      it('should create an edge between trigger and step-1', async () => {
        const result = await service.createWorkflowVersionEdge({
          source: 'trigger',
          target: 'step-3',
          workflowVersionId: mockWorkflowVersionId,
          workspaceId: mockWorkspaceId,
        });

        expect(
          mockWorkflowVersionWorkspaceRepository.update,
        ).toHaveBeenCalledWith(mockWorkflowVersionId, {
          trigger: {
            ...mockTrigger,
            nextStepIds: ['step-1', 'step-3'],
          },
        });

        expect(result).toEqual({
          triggerNextStepIds: ['step-1', 'step-3'],
          stepsNextStepIds: {
            'step-1': ['step-2'],
            'step-2': [],
            'step-3': [],
          },
        });
      });

      it('should not duplicate stepIds if edge already exists', async () => {
        const result = await service.createWorkflowVersionEdge({
          source: 'trigger',
          target: 'step-1',
          workflowVersionId: mockWorkflowVersionId,
          workspaceId: mockWorkspaceId,
        });

        expect(
          mockWorkflowVersionWorkspaceRepository.update,
        ).not.toHaveBeenCalled();

        expect(result).toEqual({
          triggerNextStepIds: ['step-1'],
          stepsNextStepIds: {
            'step-1': ['step-2'],
            'step-2': [],
            'step-3': [],
          },
        });
      });
    });

    describe('with source is a step', () => {
      it('should create an edge between step-2 and step-3', async () => {
        const result = await service.createWorkflowVersionEdge({
          source: 'step-2',
          target: 'step-3',
          workflowVersionId: mockWorkflowVersionId,
          workspaceId: mockWorkspaceId,
        });

        expect(
          mockWorkflowVersionWorkspaceRepository.update,
        ).toHaveBeenCalledWith(mockWorkflowVersionId, {
          steps: mockSteps.map((step) => {
            if (step.id === 'step-2') {
              return {
                ...step,
                nextStepIds: ['step-3'],
              };
            }

            return step;
          }),
        });

        expect(result).toEqual({
          triggerNextStepIds: ['step-1'],
          stepsNextStepIds: {
            'step-1': ['step-2'],
            'step-2': ['step-3'],
            'step-3': [],
          },
        });
      });

      it('should not duplicate if edge already exist between 2 steps', async () => {
        const result = await service.createWorkflowVersionEdge({
          source: 'step-1',
          target: 'step-2',
          workflowVersionId: mockWorkflowVersionId,
          workspaceId: mockWorkspaceId,
        });

        expect(
          mockWorkflowVersionWorkspaceRepository.update,
        ).not.toHaveBeenCalled();

        expect(result).toEqual({
          triggerNextStepIds: ['step-1'],
          stepsNextStepIds: {
            'step-1': ['step-2'],
            'step-2': [],
            'step-3': [],
          },
        });
      });

      it('should throw if source step does not exists', async () => {
        const call = async () =>
          await service.createWorkflowVersionEdge({
            source: 'not-existing-step',
            target: 'step-2',
            workflowVersionId: mockWorkflowVersionId,
            workspaceId: mockWorkspaceId,
          });

        await expect(call).rejects.toThrow(
          `Source step 'not-existing-step' not found in workflowVersion '${mockWorkflowVersionId}'`,
        );
      });
    });
  });

  describe('deleteWorkflowVersionEdge', () => {
    it('should throw if target does not exists', async () => {
      const call = async () =>
        await service.deleteWorkflowVersionEdge({
          source: 'trigger',
          target: 'not-existing-step',
          workflowVersionId: mockWorkflowVersionId,
          workspaceId: mockWorkspaceId,
        });

      await expect(call).rejects.toThrow(
        `Target step 'not-existing-step' not found in workflowVersion '${mockWorkflowVersionId}'`,
      );
    });

    describe('with source is the trigger', () => {
      it('should delete an edge between trigger and step-1', async () => {
        const result = await service.deleteWorkflowVersionEdge({
          source: 'trigger',
          target: 'step-1',
          workflowVersionId: mockWorkflowVersionId,
          workspaceId: mockWorkspaceId,
        });

        expect(
          mockWorkflowVersionWorkspaceRepository.update,
        ).toHaveBeenCalledWith(mockWorkflowVersionId, {
          trigger: {
            ...mockTrigger,
            nextStepIds: [],
          },
        });

        expect(result).toEqual({
          triggerNextStepIds: [],
          stepsNextStepIds: {
            'step-1': ['step-2'],
            'step-2': [],
            'step-3': [],
          },
        });
      });

      it('should not delete if edge does not exists', async () => {
        const result = await service.deleteWorkflowVersionEdge({
          source: 'trigger',
          target: 'step-2',
          workflowVersionId: mockWorkflowVersionId,
          workspaceId: mockWorkspaceId,
        });

        expect(
          mockWorkflowVersionWorkspaceRepository.update,
        ).not.toHaveBeenCalled();

        expect(result).toEqual({
          triggerNextStepIds: ['step-1'],
          stepsNextStepIds: {
            'step-1': ['step-2'],
            'step-2': [],
            'step-3': [],
          },
        });
      });
    });

    describe('with source is a step', () => {
      it('should delete an existing edge between two steps', async () => {
        const result = await service.deleteWorkflowVersionEdge({
          source: 'step-1',
          target: 'step-2',
          workflowVersionId: mockWorkflowVersionId,
          workspaceId: mockWorkspaceId,
        });

        expect(
          mockWorkflowVersionWorkspaceRepository.update,
        ).toHaveBeenCalledWith(mockWorkflowVersionId, {
          steps: mockSteps.map((step) => {
            if (step.id === 'step-1') {
              return {
                ...step,
                nextStepIds: [],
              };
            }

            return step;
          }),
        });

        expect(result).toEqual({
          triggerNextStepIds: ['step-1'],
          stepsNextStepIds: {
            'step-1': [],
            'step-2': [],
            'step-3': [],
          },
        });
      });

      it('should not delete if edge does not exist', async () => {
        const result = await service.deleteWorkflowVersionEdge({
          source: 'step-1',
          target: 'step-3',
          workflowVersionId: mockWorkflowVersionId,
          workspaceId: mockWorkspaceId,
        });

        expect(
          mockWorkflowVersionWorkspaceRepository.update,
        ).not.toHaveBeenCalledWith();

        expect(result).toEqual({
          triggerNextStepIds: ['step-1'],
          stepsNextStepIds: {
            'step-1': ['step-2'],
            'step-2': [],
            'step-3': [],
          },
        });
      });

      it('should throw if source step does not exists', async () => {
        const call = async () =>
          await service.deleteWorkflowVersionEdge({
            source: 'not-existing-step',
            target: 'step-2',
            workflowVersionId: mockWorkflowVersionId,
            workspaceId: mockWorkspaceId,
          });

        await expect(call).rejects.toThrow(
          `Source step 'not-existing-step' not found in workflowVersion '${mockWorkflowVersionId}'`,
        );
      });
    });
  });
});
