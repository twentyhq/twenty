import { StepStatus } from 'twenty-shared/workflow';

import { shouldExecuteChildStep } from 'src/modules/workflow/workflow-executor/utils/should-execute-child-step.util';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

describe('shouldExecuteChildStep', () => {
  const parentSteps = [
    {
      id: 'parent-1',
      type: WorkflowActionType.CODE,
      settings: {
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: false },
        },
        outputSchema: {},
      },
      nextStepIds: [],
    } as unknown as WorkflowAction,
    {
      id: 'parent-2',
      type: WorkflowActionType.SEND_EMAIL,
      settings: {
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: false },
        },
        outputSchema: {},
      },
      nextStepIds: [],
    } as unknown as WorkflowAction,
  ];

  it('should return true when there are no parent steps', () => {
    const result = shouldExecuteChildStep({
      parentSteps: [],
      stepInfos: {},
    });

    expect(result).toBe(true);
  });

  it('should return true when at least one parent succeeded and all parents are completed', () => {
    const stepInfos = {
      'parent-1': {
        status: StepStatus.SUCCESS,
      },
      'parent-2': {
        status: StepStatus.SUCCESS,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps,
      stepInfos,
    });

    expect(result).toBe(true);
  });

  it('should return true when one parent succeeded and others are stopped', () => {
    const stepInfos = {
      'parent-1': {
        status: StepStatus.SUCCESS,
      },
      'parent-2': {
        status: StepStatus.STOPPED,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps,
      stepInfos,
    });

    expect(result).toBe(true);
  });

  it('should return true when one parent succeeded and others are skipped', () => {
    const stepInfos = {
      'parent-1': {
        status: StepStatus.SUCCESS,
      },
      'parent-2': {
        status: StepStatus.SKIPPED,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps,
      stepInfos,
    });

    expect(result).toBe(true);
  });

  it('should return true when one parent succeeded and others are mix of stopped and skipped', () => {
    const multiParentSteps = [
      {
        id: 'parent-1',
        type: WorkflowActionType.CODE,
        settings: {
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
          outputSchema: {},
        },
        nextStepIds: [],
      } as unknown as WorkflowAction,
      {
        id: 'parent-2',
        type: WorkflowActionType.SEND_EMAIL,
        settings: {
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
          outputSchema: {},
        },
        nextStepIds: [],
      } as unknown as WorkflowAction,
      {
        id: 'parent-3',
        type: WorkflowActionType.CODE,
        settings: {
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
          outputSchema: {},
        },
        nextStepIds: [],
      } as unknown as WorkflowAction,
    ];

    const stepInfos = {
      'parent-1': {
        status: StepStatus.SUCCESS,
      },
      'parent-2': {
        status: StepStatus.STOPPED,
      },
      'parent-3': {
        status: StepStatus.SKIPPED,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps: multiParentSteps,
      stepInfos,
    });

    expect(result).toBe(true);
  });

  it('should return false when all parents are completed but none succeeded', () => {
    const stepInfos = {
      'parent-1': {
        status: StepStatus.STOPPED,
      },
      'parent-2': {
        status: StepStatus.SKIPPED,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should return false when one parent succeeded but another is still running', () => {
    const stepInfos = {
      'parent-1': {
        status: StepStatus.SUCCESS,
      },
      'parent-2': {
        status: StepStatus.RUNNING,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should return false when one parent succeeded but another has not started', () => {
    const stepInfos = {
      'parent-1': {
        status: StepStatus.SUCCESS,
      },
      'parent-2': {
        status: StepStatus.NOT_STARTED,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should return false when one parent succeeded but another is pending', () => {
    const stepInfos = {
      'parent-1': {
        status: StepStatus.SUCCESS,
      },
      'parent-2': {
        status: StepStatus.PENDING,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should return false when one parent succeeded but another has failed', () => {
    const stepInfos = {
      'parent-1': {
        status: StepStatus.SUCCESS,
      },
      'parent-2': {
        status: StepStatus.FAILED,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should return false when all parents are still running', () => {
    const stepInfos = {
      'parent-1': {
        status: StepStatus.RUNNING,
      },
      'parent-2': {
        status: StepStatus.RUNNING,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should return false when all parents have not started', () => {
    const stepInfos = {
      'parent-1': {
        status: StepStatus.NOT_STARTED,
      },
      'parent-2': {
        status: StepStatus.NOT_STARTED,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should return false when no parent has succeeded even though all are completed', () => {
    const stepInfos = {
      'parent-1': {
        status: StepStatus.SKIPPED,
      },
      'parent-2': {
        status: StepStatus.STOPPED,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should handle single parent step successfully', () => {
    const singleParent = [
      {
        id: 'parent-1',
        type: WorkflowActionType.CODE,
        settings: {
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
          outputSchema: {},
        },
        nextStepIds: [],
      } as unknown as WorkflowAction,
    ];

    const stepInfos = {
      'parent-1': {
        status: StepStatus.SUCCESS,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps: singleParent,
      stepInfos,
    });

    expect(result).toBe(true);
  });

  it('should return false when single parent has stopped without success', () => {
    const singleParent = [
      {
        id: 'parent-1',
        type: WorkflowActionType.CODE,
        settings: {
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
          outputSchema: {},
        },
        nextStepIds: [],
      } as unknown as WorkflowAction,
    ];

    const stepInfos = {
      'parent-1': {
        status: StepStatus.STOPPED,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps: singleParent,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should handle missing step info gracefully', () => {
    const stepInfos = {
      'parent-1': {
        status: StepStatus.SUCCESS,
      },
    };

    const result = shouldExecuteChildStep({
      parentSteps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should work correctly with multiple successful parents', () => {
    const multiParentSteps = [
      {
        id: 'parent-1',
        type: WorkflowActionType.CODE,
        settings: {
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
          outputSchema: {},
        },
        nextStepIds: [],
      } as unknown as WorkflowAction,
      {
        id: 'parent-2',
        type: WorkflowActionType.SEND_EMAIL,
        settings: {
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
          outputSchema: {},
        },
        nextStepIds: [],
      } as unknown as WorkflowAction,
      {
        id: 'parent-3',
        type: WorkflowActionType.CODE,
        settings: {
          errorHandlingOptions: {
            continueOnFailure: { value: false },
            retryOnFailure: { value: false },
          },
          outputSchema: {},
        },
        nextStepIds: [],
      } as unknown as WorkflowAction,
    ];

    const stepInfos = {
      'parent-1': { status: StepStatus.SUCCESS },
      'parent-2': { status: StepStatus.SUCCESS },
      'parent-3': { status: StepStatus.SUCCESS },
    };

    const result = shouldExecuteChildStep({
      parentSteps: multiParentSteps,
      stepInfos,
    });

    expect(result).toBe(true);
  });

  it('should return false with large number of parents when none succeeded', () => {
    const manyParentSteps = Array.from({ length: 25 }, (_, i) => ({
      id: `parent-${i + 1}`,
      type: WorkflowActionType.CODE,
      settings: {
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: false },
        },
        outputSchema: {},
      },
      nextStepIds: [],
    })) as unknown as WorkflowAction[];

    // All parents stopped or skipped, none succeeded
    const stepInfos = Object.fromEntries(
      manyParentSteps.map((step, i) => [
        step.id,
        { status: i % 2 === 0 ? StepStatus.STOPPED : StepStatus.SKIPPED },
      ]),
    );

    const result = shouldExecuteChildStep({
      parentSteps: manyParentSteps,
      stepInfos,
    });

    expect(result).toBe(false);
  });

  it('should return false with large number of parents when not all completed', () => {
    const manyParentSteps = Array.from({ length: 25 }, (_, i) => ({
      id: `parent-${i + 1}`,
      type: WorkflowActionType.CODE,
      settings: {
        errorHandlingOptions: {
          continueOnFailure: { value: false },
          retryOnFailure: { value: false },
        },
        outputSchema: {},
      },
      nextStepIds: [],
    })) as unknown as WorkflowAction[];

    // First parent succeeded, rest are still running
    const stepInfos = Object.fromEntries(
      manyParentSteps.map((step, i) => [
        step.id,
        { status: i === 0 ? StepStatus.SUCCESS : StepStatus.RUNNING },
      ]),
    );

    const result = shouldExecuteChildStep({
      parentSteps: manyParentSteps,
      stepInfos,
    });

    expect(result).toBe(false);
  });
});
