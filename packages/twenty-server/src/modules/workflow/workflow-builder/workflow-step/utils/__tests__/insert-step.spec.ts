import { insertStep } from 'src/modules/workflow/workflow-builder/workflow-step/utils/insert-step';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

describe('insertStep', () => {
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

  it('should insert a step at the end of the array when no parent or next step is specified', () => {
    const step1 = createMockAction('1');
    const step2 = createMockAction('2');
    const newStep = createMockAction('new');

    const result = insertStep({
      existingSteps: [step1, step2],
      insertedStep: newStep,
    });

    expect(result).toEqual([step1, step2, newStep]);
  });

  it('should update parent step nextStepIds when inserting a step between two steps', () => {
    const step1 = createMockAction('1', ['2']);
    const step2 = createMockAction('2');
    const newStep = createMockAction('new');

    const result = insertStep({
      existingSteps: [step1, step2],
      insertedStep: newStep,
      parentStepId: '1',
      nextStepId: '2',
    });

    expect(result).toEqual([
      { ...step1, nextStepIds: ['new'] },
      step2,
      { ...newStep, nextStepIds: ['2'] },
    ]);
  });

  it('should handle inserting a step at the beginning of the workflow', () => {
    const step1 = createMockAction('1');
    const newStep = createMockAction('new');

    const result = insertStep({
      existingSteps: [step1],
      insertedStep: newStep,
      parentStepId: undefined,
      nextStepId: '1',
    });

    expect(result).toEqual([step1, { ...newStep, nextStepIds: ['1'] }]);
  });

  it('should handle inserting a step at the end of the workflow', () => {
    const step1 = createMockAction('1');
    const newStep = createMockAction('new');

    const result = insertStep({
      existingSteps: [step1],
      insertedStep: newStep,
      parentStepId: '1',
      nextStepId: undefined,
    });

    expect(result).toEqual([{ ...step1, nextStepIds: ['new'] }, newStep]);
  });

  it('should handle inserting a step between two steps with multiple nextStepIds', () => {
    const step1 = createMockAction('1', ['2', '3']);
    const step2 = createMockAction('2');
    const step3 = createMockAction('3');
    const newStep = createMockAction('new');

    const result = insertStep({
      existingSteps: [step1, step2, step3],
      insertedStep: newStep,
      parentStepId: '1',
      nextStepId: '2',
    });

    expect(result).toEqual([
      { ...step1, nextStepIds: ['3', 'new'] },
      step2,
      step3,
      { ...newStep, nextStepIds: ['2'] },
    ]);
  });
});
