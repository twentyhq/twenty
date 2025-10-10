import { StepStatus } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { shouldExecuteStep } from 'src/modules/workflow/workflow-executor/utils/should-execute-step.util';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

describe('shouldExecuteStep', () => {
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

    const result = shouldExecuteStep({
      stepInfos,
      steps,
      step: steps[2],
      workflowRunStatus: WorkflowRunStatus.RUNNING,
    });

    expect(result).toBe(true);
  });

  it('should return false if one parent is not succeeded', () => {
    expect(
      shouldExecuteStep({
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
        step: steps[2],
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }),
    ).toBe(false);

    expect(
      shouldExecuteStep({
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
        step: steps[2],
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }),
    ).toBe(false);

    expect(
      shouldExecuteStep({
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
        step: steps[2],
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }),
    ).toBe(false);
  });

  it('should return false if step has already ran', () => {
    expect(
      shouldExecuteStep({
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
        step: steps[2],
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }),
    ).toBe(false);

    expect(
      shouldExecuteStep({
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
        step: steps[2],
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }),
    ).toBe(false);

    expect(
      shouldExecuteStep({
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
        step: steps[2],
        workflowRunStatus: WorkflowRunStatus.RUNNING,
      }),
    ).toBe(false);

    expect(
      shouldExecuteStep({
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
        step: steps[2],
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
      const result = shouldExecuteStep({
        stepInfos,
        steps,
        step: steps[2],
        workflowRunStatus,
      });

      expect(result).toBe(false);
    }
  });

  it('should return true when step has no parent steps', () => {
    const stepsWithoutParents = [
      {
        id: 'step-1',
        name: 'Mock Step',
        type: WorkflowActionType.CODE,
        settings: {
          input: {
            serverlessFunctionId: 'mock-function-id',
            serverlessFunctionVersion: 'mock-function-version',
            serverlessFunctionInput: {},
          },
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
          outputSchema: {},
        },
        valid: true,
        nextStepIds: [],
      },
    ] as WorkflowAction[];

    const stepInfos = {
      'step-1': {
        status: StepStatus.NOT_STARTED,
      },
    };

    const result = shouldExecuteStep({
      stepInfos,
      steps: stepsWithoutParents,
      step: stepsWithoutParents[0],
      workflowRunStatus: WorkflowRunStatus.RUNNING,
    });

    expect(result).toBe(true);
  });

  it('should return false when one parent is RUNNING', () => {
    const result = shouldExecuteStep({
      stepInfos: {
        'step-1': {
          status: StepStatus.SUCCESS,
        },
        'step-2': {
          status: StepStatus.RUNNING,
        },
        'step-3': {
          status: StepStatus.NOT_STARTED,
        },
      },
      steps,
      step: steps[2],
      workflowRunStatus: WorkflowRunStatus.RUNNING,
    });

    expect(result).toBe(false);
  });

  it('should handle undefined parent steps gracefully', () => {
    const stepsWithUndefined = [
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
      undefined as unknown as WorkflowAction,
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

    const stepInfos = {
      'step-1': {
        status: StepStatus.SUCCESS,
      },
      'step-3': {
        status: StepStatus.NOT_STARTED,
      },
    };

    const result = shouldExecuteStep({
      stepInfos,
      steps: stepsWithUndefined,
      step: stepsWithUndefined[2],
      workflowRunStatus: WorkflowRunStatus.RUNNING,
    });

    expect(result).toBe(true);
  });

  it('should return false when at least one parent is FAILED', () => {
    const result = shouldExecuteStep({
      stepInfos: {
        'step-1': {
          status: StepStatus.SUCCESS,
        },
        'step-2': {
          status: StepStatus.FAILED,
        },
        'step-3': {
          status: StepStatus.NOT_STARTED,
        },
      },
      steps,
      step: steps[2],
      workflowRunStatus: WorkflowRunStatus.RUNNING,
    });

    expect(result).toBe(false);
  });

  it('should work correctly with multiple successful parents', () => {
    const multiParentSteps = [
      {
        id: 'step-1',
        type: WorkflowActionType.CODE,
        settings: {
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
        },
        nextStepIds: ['step-4'],
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
        nextStepIds: ['step-4'],
      },
      {
        id: 'step-3',
        type: WorkflowActionType.CODE,
        settings: {
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
        },
        nextStepIds: ['step-4'],
      },
      {
        id: 'step-4',
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

    const stepInfos = {
      'step-1': { status: StepStatus.SUCCESS },
      'step-2': { status: StepStatus.SUCCESS },
      'step-3': { status: StepStatus.SUCCESS },
      'step-4': { status: StepStatus.NOT_STARTED },
    };

    const result = shouldExecuteStep({
      stepInfos,
      steps: multiParentSteps,
      step: multiParentSteps[3],
      workflowRunStatus: WorkflowRunStatus.RUNNING,
    });

    expect(result).toBe(true);
  });

  it('should return false when step status is SKIPPED', () => {
    const result = shouldExecuteStep({
      stepInfos: {
        'step-1': {
          status: StepStatus.SUCCESS,
        },
        'step-2': {
          status: StepStatus.SUCCESS,
        },
        'step-3': {
          status: StepStatus.SKIPPED,
        },
      },
      steps,
      step: steps[2],
      workflowRunStatus: WorkflowRunStatus.RUNNING,
    });

    expect(result).toBe(false);
  });

  it('should return false when step status is STOPPED', () => {
    const result = shouldExecuteStep({
      stepInfos: {
        'step-1': {
          status: StepStatus.SUCCESS,
        },
        'step-2': {
          status: StepStatus.SUCCESS,
        },
        'step-3': {
          status: StepStatus.STOPPED,
        },
      },
      steps,
      step: steps[2],
      workflowRunStatus: WorkflowRunStatus.RUNNING,
    });

    expect(result).toBe(false);
  });
});
