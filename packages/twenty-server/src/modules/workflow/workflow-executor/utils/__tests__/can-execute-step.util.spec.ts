import { StepStatus } from 'twenty-shared/workflow';

import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { canExecuteStep } from 'src/modules/workflow/workflow-executor/utils/can-execute-step.util';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

describe('canExecuteStep', () => {
  const steps = [
    {
      id: 'step-1',
      type: WorkflowActionType.CODE,
      settings: {
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: false },
        },
      },
      nextStepIds: ['step-3'],
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
      nextStepIds: ['step-3'],
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

  it('should return true if all parents succeeded', () => {
    const stepInfos = {
      'step-1': {
        status: StepStatus.SUCCESS,
      },
      'step-2': {
        status: StepStatus.SUCCESS,
      },
      'step-3': {
        status: StepStatus.NOT_STARTED,
      },
    };

    const result = canExecuteStep({
      stepInfos,
      steps,
      stepId: 'step-3',
      workflowRunStatus: WorkflowRunStatus.RUNNING,
    });

    expect(result).toBe(true);
  });

  it('should return false if one parent is not succeeded', () => {
    expect(
      canExecuteStep({
        stepInfos: {
          'step-1': {
            status: StepStatus.NOT_STARTED,
          },
          'step-2': {
            status: StepStatus.SUCCESS,
          },
          'step-3': {
            status: StepStatus.NOT_STARTED,
          },
        },
        steps,
        stepId: 'step-3',
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }),
    ).toBe(false);

    expect(
      canExecuteStep({
        stepInfos: {
          'step-1': {
            status: StepStatus.SUCCESS,
          },
          'step-2': {
            status: StepStatus.NOT_STARTED,
          },
          'step-3': {
            status: StepStatus.NOT_STARTED,
          },
        },
        steps,
        stepId: 'step-3',
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }),
    ).toBe(false);

    expect(
      canExecuteStep({
        stepInfos: {
          'step-1': {
            status: StepStatus.NOT_STARTED,
          },
          'step-2': {
            status: StepStatus.NOT_STARTED,
          },
          'step-3': {
            status: StepStatus.NOT_STARTED,
          },
        },
        steps,
        stepId: 'step-3',
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }),
    ).toBe(false);
  });

  it('should return false if step has already ran', () => {
    expect(
      canExecuteStep({
        stepInfos: {
          'step-1': {
            status: StepStatus.SUCCESS,
          },
          'step-2': {
            status: StepStatus.SUCCESS,
          },
          'step-3': {
            status: StepStatus.SUCCESS,
          },
        },
        steps,
        stepId: 'step-3',
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }),
    ).toBe(false);

    expect(
      canExecuteStep({
        stepInfos: {
          'step-1': {
            status: StepStatus.SUCCESS,
          },
          'step-2': {
            status: StepStatus.SUCCESS,
          },
          'step-3': {
            status: StepStatus.PENDING,
          },
        },
        steps,
        stepId: 'step-3',
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }),
    ).toBe(false);

    expect(
      canExecuteStep({
        stepInfos: {
          'step-1': {
            status: StepStatus.SUCCESS,
          },
          'step-2': {
            status: StepStatus.SUCCESS,
          },
          'step-3': {
            status: StepStatus.FAILED,
          },
        },
        steps,
        stepId: 'step-3',
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }),
    ).toBe(false);

    expect(
      canExecuteStep({
        stepInfos: {
          'step-1': {
            status: StepStatus.SUCCESS,
          },
          'step-2': {
            status: StepStatus.SUCCESS,
          },
          'step-3': {
            status: StepStatus.RUNNING,
          },
        },
        steps,
        stepId: 'step-3',
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }),
    ).toBe(false);
  });

  it('should return false if workflowRun is not RUNNING', () => {
    const stepInfos = {
      'step-1': {
        status: StepStatus.SUCCESS,
      },
      'step-2': {
        status: StepStatus.SUCCESS,
      },
      'step-3': {
        status: StepStatus.NOT_STARTED,
      },
    };

    for (const workflowRunStatus of [
      WorkflowRunStatus.FAILED,
      WorkflowRunStatus.ENQUEUED,
      WorkflowRunStatus.COMPLETED,
      WorkflowRunStatus.NOT_STARTED,
    ]) {
      const result = canExecuteStep({
        stepInfos,
        steps,
        stepId: 'step-3',
        workflowRunStatus,
      });

      expect(result).toBe(false);
    }
  });
});
