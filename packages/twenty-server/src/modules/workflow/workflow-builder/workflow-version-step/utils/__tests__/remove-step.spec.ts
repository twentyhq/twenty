import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { removeStep } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/remove-step';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const mockTrigger = {
  name: 'Trigger',
  type: WorkflowTriggerType.MANUAL,
  settings: { outputSchema: {} },
  nextStepIds: ['1'],
} as WorkflowTrigger;

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
      existingTrigger: mockTrigger,
      existingSteps: [step1, step2, step3],
      stepIdToDelete: '2',
    });

    expect(result.updatedSteps).toEqual([step1, step3]);
    expect(result.updatedTrigger).toEqual(mockTrigger);
  });

  it('should handle removing a step that has no next steps', () => {
    const step1 = createMockAction('1', ['2']);
    const step2 = createMockAction('2');
    const step3 = createMockAction('3');

    const result = removeStep({
      existingTrigger: mockTrigger,
      existingSteps: [step1, step2, step3],
      stepIdToDelete: '2',
    });

    expect(result.updatedSteps).toEqual([{ ...step1, nextStepIds: [] }, step3]);
    expect(result.updatedTrigger).toEqual(mockTrigger);
  });

  it('should update nextStepIds of parent steps to include children of removed step', () => {
    const step1 = createMockAction('1', ['2']);
    const step2 = createMockAction('2', ['3']);
    const step3 = createMockAction('3');

    const result = removeStep({
      existingTrigger: mockTrigger,
      existingSteps: [step1, step2, step3],
      stepIdToDelete: '2',
      stepToDeleteChildrenIds: ['3'],
    });

    expect(result.updatedSteps).toEqual([
      { ...step1, nextStepIds: ['3'] },
      step3,
    ]);
    expect(result.updatedTrigger).toEqual(mockTrigger);
  });

  it('should handle multiple parent steps pointing to the same step', () => {
    const step1 = createMockAction('1', ['3']);
    const step2 = createMockAction('2', ['3']);
    const step3 = createMockAction('3', ['4']);
    const step4 = createMockAction('4');

    const result = removeStep({
      existingTrigger: mockTrigger,
      existingSteps: [step1, step2, step3, step4],
      stepIdToDelete: '3',
      stepToDeleteChildrenIds: ['4'],
    });

    expect(result.updatedSteps).toEqual([
      { ...step1, nextStepIds: ['4'] },
      { ...step2, nextStepIds: ['4'] },
      step4,
    ]);
    expect(result.updatedTrigger).toEqual(mockTrigger);
  });

  it('should handle removing a step with multiple children', () => {
    const step1 = createMockAction('1', ['2']);
    const step2 = createMockAction('2', ['3', '4']);
    const step3 = createMockAction('3');
    const step4 = createMockAction('4');

    const result = removeStep({
      existingTrigger: mockTrigger,
      existingSteps: [step1, step2, step3, step4],
      stepIdToDelete: '2',
      stepToDeleteChildrenIds: ['3', '4'],
    });

    expect(result.updatedSteps).toEqual([
      { ...step1, nextStepIds: ['3', '4'] },
      step3,
      step4,
    ]);
    expect(result.updatedTrigger).toEqual(mockTrigger);
  });

  it('should handle removing a step linked to trigger', () => {
    const step1 = createMockAction('1', ['2']);
    const step2 = createMockAction('2', ['3']);
    const step3 = createMockAction('3');

    const result = removeStep({
      existingTrigger: mockTrigger,
      existingSteps: [step1, step2, step3],
      stepIdToDelete: '1',
      stepToDeleteChildrenIds: ['2'],
    });

    expect(result.updatedSteps).toEqual([step2, step3]);
    expect(result.updatedTrigger).toEqual({
      ...mockTrigger,
      nextStepIds: ['2'],
    });
  });

  it('should remove trigger if steps are null', () => {
    const result = removeStep({
      existingTrigger: { ...mockTrigger, nextStepIds: [] },
      existingSteps: null,
      stepIdToDelete: TRIGGER_STEP_ID,
    });

    expect(result.updatedTrigger).toEqual(null);
    expect(result.updatedSteps).toEqual(null);
  });

  it('should handle removing a step that is part of iteratorLoopStepIds', () => {
    const step1 = createMockAction('1', ['2']);
    const iteratorStep = {
      id: '2',
      name: 'Iterator Step',
      type: WorkflowActionType.ITERATOR,
      settings: {
        input: {
          initialLoopStepIds: ['3'],
          iterableValue: { value: [] },
          iteratorKey: 'item',
        },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: false },
          continueOnFailure: { value: false },
        },
      },
      valid: true,
      nextStepIds: ['4'],
    } as WorkflowAction;
    const step3 = createMockAction('3', ['5']);
    const step4 = createMockAction('4');
    const step5 = createMockAction('5');

    const result = removeStep({
      existingTrigger: mockTrigger,
      existingSteps: [step1, iteratorStep, step3, step4, step5],
      stepIdToDelete: '3',
      stepToDeleteChildrenIds: ['5'],
    });

    expect(result.updatedSteps).toEqual([
      step1,
      {
        ...iteratorStep,
        settings: {
          ...iteratorStep.settings,
          input: {
            ...iteratorStep.settings.input,
            initialLoopStepIds: ['5'],
          },
        },
      },
      step4,
      step5,
    ]);
    expect(result.updatedTrigger).toEqual(mockTrigger);
  });
});
