import { WorkflowStepExecutorException } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { getPreviousStepOutput } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/get-previous-step-output.util';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

describe('getPreviousStepOutput', () => {
  const mockSteps: WorkflowAction[] = [
    {
      id: 'step1',
      nextStepIds: ['step2'],
    } as WorkflowAction,
    {
      id: 'step2',
      nextStepIds: ['step3'],
    } as WorkflowAction,
    {
      id: 'step3',
      nextStepIds: undefined,
    } as WorkflowAction,
  ];

  const mockContext = {
    step1: { data: 'step1 output' },
    step2: { data: 'step2 output' },
  };

  it('should return the previous step output when valid', () => {
    const result = getPreviousStepOutput(mockSteps, 'step2', mockContext);

    expect(result).toEqual({ data: 'step1 output' });
  });

  it('should throw an error when there is no previous step', () => {
    expect(() =>
      getPreviousStepOutput(mockSteps, 'step1', mockContext),
    ).toThrow(WorkflowStepExecutorException);
  });

  it('should throw an error when there are multiple previous steps', () => {
    const stepsWithMultiplePrevious: WorkflowAction[] = [
      {
        id: 'step1',
        nextStepIds: ['step3'],
      } as WorkflowAction,
      {
        id: 'step2',
        nextStepIds: ['step3'],
      } as WorkflowAction,
      {
        id: 'step3',
        nextStepIds: undefined,
      } as WorkflowAction,
    ];

    expect(() =>
      getPreviousStepOutput(stepsWithMultiplePrevious, 'step3', mockContext),
    ).toThrow(WorkflowStepExecutorException);
  });

  it('should throw an error when previous step output is not found', () => {
    const emptyContext = {};

    expect(() =>
      getPreviousStepOutput(mockSteps, 'step2', emptyContext),
    ).toThrow(WorkflowStepExecutorException);
  });
});
