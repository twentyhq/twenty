import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { getRootSteps } from 'src/modules/workflow/workflow-runner/utils/get-root-steps.utils';

describe('getRootSteps', () => {
  it('should return the root steps', () => {
    const steps = [
      {
        id: 'step1',
        nextStepIds: ['step2'],
      },
      { id: 'step2', nextStepIds: undefined },
    ] as WorkflowAction[];

    const expectedRootSteps = [
      {
        id: 'step1',
        nextStepIds: ['step2'],
      },
    ] as WorkflowAction[];

    expect(getRootSteps(steps)).toEqual(expectedRootSteps);
  });

  it('should not consider step order', () => {
    const steps = [
      { id: 'step2', nextStepIds: undefined },
      {
        id: 'step1',
        nextStepIds: ['step2'],
      },
    ] as WorkflowAction[];

    const expectedRootSteps = [
      {
        id: 'step1',
        nextStepIds: ['step2'],
      },
    ] as WorkflowAction[];

    expect(getRootSteps(steps)).toEqual(expectedRootSteps);
  });

  it('should handle multiple root steps', () => {
    const steps = [
      {
        id: 'step1',
        nextStepIds: ['step3'],
      },
      {
        id: 'step2',
        nextStepIds: ['step3'],
      },
      { id: 'step3', nextStepIds: ['step4'] },
      { id: 'step4', nextStepIds: undefined },
    ] as WorkflowAction[];

    const expectedRootSteps = [
      {
        id: 'step1',
        nextStepIds: ['step3'],
      },
      {
        id: 'step2',
        nextStepIds: ['step3'],
      },
    ] as WorkflowAction[];

    expect(getRootSteps(steps)).toEqual(expectedRootSteps);
  });

  it('should throw if buggy steps provided', () => {
    const steps = [
      {
        id: 'step1',
        nextStepIds: ['step2'],
      },
      {
        id: 'step2',
        nextStepIds: ['step1'],
      },
    ] as WorkflowAction[];

    expect(() => getRootSteps(steps)).toThrow('No root step found');
  });
});
