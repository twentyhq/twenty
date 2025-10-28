import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { insertStep } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/insert-step';
import {
  type WorkflowAction,
  type WorkflowIteratorAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const mockIteratorStep: WorkflowIteratorAction = {
  id: '1',
  name: 'Iterator 1',
  type: WorkflowActionType.ITERATOR,
  settings: {
    input: {
      initialLoopStepIds: ['existing-loop-step'],
      items: [],
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  },
  valid: true,
};

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

  const createMockTrigger = (nextStepIds: string[]): WorkflowTrigger => ({
    name: 'Trigger',
    type: WorkflowTriggerType.MANUAL,
    settings: { outputSchema: {} },
    nextStepIds,
  });

  it('should insert a step at the end of the array when no parent or next step is specified', () => {
    const existingTrigger = createMockTrigger(['1']);
    const step1 = createMockAction('1');
    const step2 = createMockAction('2');
    const newStep = createMockAction('new');

    const result = insertStep({
      existingSteps: [step1, step2],
      insertedStep: newStep,
      existingTrigger,
    });

    expect(result.updatedSteps).toEqual([step1, step2, newStep]);
    expect(result.updatedInsertedStep).toEqual(newStep);
  });

  it('should update parent step nextStepIds when inserting a step between two steps', () => {
    const existingTrigger = createMockTrigger(['1']);
    const step1 = createMockAction('1', ['2']);
    const step2 = createMockAction('2');
    const newStep = createMockAction('new');

    const result = insertStep({
      existingSteps: [step1, step2],
      insertedStep: newStep,
      existingTrigger,
      parentStepId: '1',
      nextStepId: '2',
    });

    expect(result.updatedSteps).toEqual([
      { ...step1, nextStepIds: ['new'] },
      step2,
      { ...newStep, nextStepIds: ['2'] },
    ]);
  });

  it('should handle inserting a step at the beginning of the workflow', () => {
    const existingTrigger = createMockTrigger(['1']);
    const step1 = createMockAction('1');
    const newStep = createMockAction('new');

    const result = insertStep({
      existingTrigger,
      existingSteps: [step1],
      insertedStep: newStep,
      parentStepId: undefined,
      nextStepId: '1',
    });

    expect(result.updatedSteps).toEqual([
      step1,
      { ...newStep, nextStepIds: ['1'] },
    ]);
  });

  it('should handle inserting a step at the end of the workflow', () => {
    const existingTrigger = createMockTrigger(['1']);
    const step1 = createMockAction('1');
    const newStep = createMockAction('new');

    const result = insertStep({
      existingTrigger,
      existingSteps: [step1],
      insertedStep: newStep,
      parentStepId: '1',
      nextStepId: undefined,
    });

    expect(result.updatedSteps).toEqual([
      { ...step1, nextStepIds: ['new'] },
      newStep,
    ]);
  });

  it('should handle inserting a step between two steps with multiple nextStepIds', () => {
    const existingTrigger = createMockTrigger(['1']);
    const step1 = createMockAction('1', ['2', '3']);
    const step2 = createMockAction('2');
    const step3 = createMockAction('3');
    const newStep = createMockAction('new');

    const result = insertStep({
      existingTrigger,
      existingSteps: [step1, step2, step3],
      insertedStep: newStep,
      parentStepId: '1',
      nextStepId: '2',
    });

    expect(result.updatedSteps).toEqual([
      { ...step1, nextStepIds: ['3', 'new'] },
      step2,
      step3,
      { ...newStep, nextStepIds: ['2'] },
    ]);
  });

  it('should handle inserting after trigger', () => {
    const existingTrigger = createMockTrigger(['1']);
    const step1 = createMockAction('1');
    const newStep = createMockAction('new');

    const result = insertStep({
      existingTrigger,
      existingSteps: [step1],
      insertedStep: newStep,
      parentStepId: TRIGGER_STEP_ID,
      nextStepId: undefined,
    });

    expect(result.updatedSteps).toEqual([step1, newStep]);
    expect(result.updatedTrigger).toEqual({
      ...existingTrigger,
      nextStepIds: ['1', 'new'],
    });
  });

  it('should add step to iterator initialLoopStepIds when isConnectedToLoop is true', () => {
    const existingTrigger = createMockTrigger(['1']);
    const newStep = createMockAction('new');

    const result = insertStep({
      existingTrigger,
      existingSteps: [mockIteratorStep],
      insertedStep: newStep,
      parentStepId: '1',
      parentStepConnectionOptions: {
        connectedStepType: WorkflowActionType.ITERATOR,
        settings: {
          isConnectedToLoop: true,
        },
      },
    });

    const updatedIteratorStep = result
      .updatedSteps[0] as WorkflowIteratorAction;

    expect(updatedIteratorStep.settings.input.initialLoopStepIds).toEqual([
      'existing-loop-step',
      'new',
    ]);
  });

  it('should not add step to iterator initialLoopStepIds when isConnectedToLoop is false', () => {
    const existingTrigger = createMockTrigger(['1']);
    const newStep = createMockAction('new');

    const result = insertStep({
      existingTrigger,
      existingSteps: [mockIteratorStep],
      insertedStep: newStep,
      parentStepId: '1',
      parentStepConnectionOptions: {
        connectedStepType: WorkflowActionType.ITERATOR,
        settings: {
          isConnectedToLoop: false,
        },
      },
    });

    const updatedIteratorStep = result
      .updatedSteps[0] as WorkflowIteratorAction;

    expect(updatedIteratorStep.settings.input.initialLoopStepIds).toEqual([
      'existing-loop-step',
    ]);
  });

  it('should handle inserting a step between two steps within an iterator', () => {
    const existingTrigger = createMockTrigger(['1']);
    const insertedStep = createMockAction('2');

    const result = insertStep({
      existingTrigger,
      existingSteps: [mockIteratorStep],
      insertedStep,
      parentStepId: '1',
      nextStepId: 'existing-loop-step',
      parentStepConnectionOptions: {
        connectedStepType: WorkflowActionType.ITERATOR,
        settings: {
          isConnectedToLoop: true,
        },
      },
    });

    const updatedIteratorStep = result.updatedSteps.find(
      (step) => step.id === mockIteratorStep.id,
    ) as WorkflowIteratorAction;
    const updatedInsertedStep = result.updatedSteps.find(
      (step) => step.id === insertedStep.id,
    ) as WorkflowAction;

    expect(updatedIteratorStep.settings.input.initialLoopStepIds).toEqual([
      insertedStep.id,
    ]);
    expect(updatedInsertedStep.nextStepIds).toEqual(['existing-loop-step']);
  });
});
