import { removeStep } from 'src/modules/workflow/workflow-builder/workflow-step/utils/remove-step';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

describe('removeStep', () => {
  const createMockAction = (
    id: string,
    nextStepIds?: string[],
  ): WorkflowAction => ({
    id,
    name: `Action ${id}`,
    type: WorkflowActionType.CODE,
    settings: {
      input: {
        serverlessFunctionId: 'test',
        serverlessFunctionVersion: '1.0.0',
        serverlessFunctionInput: {},
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false },
      },
    },
    valid: true,
    nextStepIds,
  });

  it('should remove the specified step from the array', () => {
    const step1 = createMockAction('1');
    const step2 = createMockAction('2');
    const step3 = createMockAction('3');

    const result = removeStep({
      existingSteps: [step1, step2, step3],
      stepIdToDelete: '2',
    });

    expect(result).toEqual([step1, step3]);
  });

  it('should handle removing a step that has no next steps', () => {
    const step1 = createMockAction('1', ['2']);
    const step2 = createMockAction('2');
    const step3 = createMockAction('3');

    const result = removeStep({
      existingSteps: [step1, step2, step3],
      stepIdToDelete: '2',
    });

    expect(result).toEqual([{ ...step1, nextStepIds: [] }, step3]);
  });

  it('should update nextStepIds of parent steps to include children of removed step', () => {
    const step1 = createMockAction('1', ['2']);
    const step2 = createMockAction('2', ['3']);
    const step3 = createMockAction('3');

    const result = removeStep({
      existingSteps: [step1, step2, step3],
      stepIdToDelete: '2',
      stepToDeleteChildrenIds: ['3'],
    });

    expect(result).toEqual([{ ...step1, nextStepIds: ['3'] }, step3]);
  });

  it('should handle multiple parent steps pointing to the same step', () => {
    const step1 = createMockAction('1', ['3']);
    const step2 = createMockAction('2', ['3']);
    const step3 = createMockAction('3', ['4']);
    const step4 = createMockAction('4');

    const result = removeStep({
      existingSteps: [step1, step2, step3, step4],
      stepIdToDelete: '3',
      stepToDeleteChildrenIds: ['4'],
    });

    expect(result).toEqual([
      { ...step1, nextStepIds: ['4'] },
      { ...step2, nextStepIds: ['4'] },
      step4,
    ]);
  });

  it('should handle removing a step with multiple children', () => {
    const step1 = createMockAction('1', ['2']);
    const step2 = createMockAction('2', ['3', '4']);
    const step3 = createMockAction('3');
    const step4 = createMockAction('4');

    const result = removeStep({
      existingSteps: [step1, step2, step3, step4],
      stepIdToDelete: '2',
      stepToDeleteChildrenIds: ['3', '4'],
    });

    expect(result).toEqual([
      { ...step1, nextStepIds: ['3', '4'] },
      step3,
      step4,
    ]);
  });
});
