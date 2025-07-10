import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { canExecuteStep } from 'src/modules/workflow/workflow-executor/utils/can-execute-step.utils';

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
    const context = {
      trigger: 'trigger result',
      'step-1': 'step-1 result',
      'step-2': 'step-2 result',
    };

    const result = canExecuteStep({ context, steps, stepId: 'step-3' });

    expect(result).toBe(true);
  });

  it('should return false if one parent is not succeeded', () => {
    expect(
      canExecuteStep({
        context: {
          trigger: 'trigger result',
          'step-2': 'step-2 result',
        },
        steps,
        stepId: 'step-3',
      }),
    ).toBe(false);

    expect(
      canExecuteStep({
        context: {
          trigger: 'trigger result',
          'step-1': 'step-1 result',
        },
        steps,
        stepId: 'step-3',
      }),
    ).toBe(false);

    expect(
      canExecuteStep({
        context: {
          trigger: 'trigger result',
          'step-1': {},
        },
        steps,
        stepId: 'step-3',
      }),
    ).toBe(false);
  });
});
