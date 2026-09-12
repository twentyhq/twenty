import { TRIGGER_STEP_ID, WorkflowActionType } from 'twenty-shared/workflow';

import { insertStep } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/insert-step';
import {
  type WorkflowAction,
  type WorkflowEmptyAction,
  type WorkflowIfElseAction,
  type WorkflowIteratorAction,
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
      retryOnFailure: { value: 0 },
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
        logicFunctionId: 'test',
        logicFunctionInput: {},
      },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
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

  const createMockIfElseAction = (): WorkflowIfElseAction => ({
    ...createMockAction('if-else'),
    type: WorkflowActionType.IF_ELSE,
    settings: {
      ...createMockAction('if-else').settings,
      input: {
        stepFilterGroups: [],
        stepFilters: [],
        branches: [
          {
            id: 'if',
            filterGroupId: 'filter-if',
            nextStepIds: ['shared', 'other'],
          },
          {
            id: 'else-if',
            filterGroupId: 'filter-else-if',
            nextStepIds: ['shared'],
          },
          { id: 'else', nextStepIds: ['shared'] },
        ],
      },
    },
  });

  const createEmptyAction = (id: string): WorkflowEmptyAction => ({
    ...createMockAction(id),
    type: WorkflowActionType.EMPTY,
    settings: { ...createMockAction(id).settings, input: {} },
  });

  it.each(['action', 'if', 'else-if', 'else'])(
    'preserves the downstream continuation when inserting If/Else on %s',
    (parentConnection) => {
      const parentStep =
        parentConnection === 'action'
          ? createMockAction('parent', ['shared'])
          : createMockIfElseAction();
      const branchSteps = [
        createEmptyAction('new-if'),
        createEmptyAction('new-else'),
      ];
      const insertedStep: WorkflowIfElseAction = {
        ...createMockIfElseAction(),
        id: 'new',
        settings: {
          ...createMockIfElseAction().settings,
          input: {
            ...createMockIfElseAction().settings.input,
            branches: [
              {
                id: 'new-if-branch',
                filterGroupId: 'new-filter',
                nextStepIds: ['new-if'],
              },
              { id: 'new-else-branch', nextStepIds: ['new-else'] },
            ],
          },
        },
      };

      const result = insertStep({
        existingSteps: [parentStep, createMockAction('shared')],
        existingTrigger: null,
        insertedStep,
        additionalCreatedSteps: branchSteps,
        parentStepId: parentStep.id,
        nextStepId: 'shared',
        parentStepConnectionOptions:
          parentConnection === 'action'
            ? undefined
            : {
                connectedStepType: WorkflowActionType.IF_ELSE,
                settings: { branchId: parentConnection },
              },
      });

      expect(result.updatedInsertedStep).toEqual(insertedStep);
      for (const branchStep of branchSteps) {
        expect(
          result.updatedSteps.find((step) => step.id === branchStep.id),
        ).toEqual({
          ...branchStep,
          nextStepIds: ['shared'],
        });
        expect(branchStep.nextStepIds).toBeUndefined();
      }
    },
  );

  it('keeps new branch placeholders empty when there is no downstream action', () => {
    const branchSteps = [
      createEmptyAction('shared'),
      createEmptyAction('other'),
    ];
    const insertedStep = createMockIfElseAction();
    const result = insertStep({
      existingSteps: [],
      existingTrigger: null,
      insertedStep,
      additionalCreatedSteps: branchSteps,
    });

    expect(result.updatedSteps).toEqual([insertedStep, ...branchSteps]);
  });

  it('preserves the iterator loop while connecting its completion to the downstream action', () => {
    const loopStep = {
      ...createEmptyAction('existing-loop-step'),
      nextStepIds: [mockIteratorStep.id],
    };
    const result = insertStep({
      existingSteps: [createMockAction('downstream')],
      existingTrigger: createMockTrigger(['downstream']),
      insertedStep: mockIteratorStep,
      additionalCreatedSteps: [loopStep],
      parentStepId: TRIGGER_STEP_ID,
      nextStepId: 'downstream',
    });

    expect(result.updatedInsertedStep.nextStepIds).toEqual(['downstream']);
    expect(result.updatedSteps).toContainEqual(loopStep);
    expect(result.updatedTrigger?.nextStepIds).toEqual([mockIteratorStep.id]);
  });

  it.each(['if', 'else-if', 'else'])(
    'inserts an action only on the selected %s branch',
    (branchId) => {
      const parentStep = createMockIfElseAction();
      const existingAction = createMockAction('shared', ['downstream']);
      const insertedStep = createMockAction('new');
      const existingTrigger = createMockTrigger(['if-else']);

      const result = insertStep({
        existingSteps: [parentStep, existingAction],
        existingTrigger,
        insertedStep,
        parentStepId: parentStep.id,
        nextStepId: existingAction.id,
        parentStepConnectionOptions: {
          connectedStepType: WorkflowActionType.IF_ELSE,
          settings: { branchId },
        },
      });

      expect(result.updatedSteps).toEqual([
        {
          ...parentStep,
          settings: {
            ...parentStep.settings,
            input: {
              ...parentStep.settings.input,
              branches: parentStep.settings.input.branches.map((branch) =>
                branch.id === branchId
                  ? {
                      ...branch,
                      nextStepIds: branch.nextStepIds.map((stepId) =>
                        stepId === 'shared' ? 'new' : stepId,
                      ),
                    }
                  : branch,
              ),
            },
          },
        },
        existingAction,
        { ...insertedStep, nextStepIds: ['shared'] },
      ]);
      expect(result.updatedTrigger).toEqual(existingTrigger);
      expect(parentStep).toEqual(createMockIfElseAction());
    },
  );

  it.each([
    { branchId: 'missing', nextStepId: 'shared' },
    { branchId: 'if', nextStepId: 'missing' },
  ])('rejects a missing branch or a stale connection: %j', (connection) => {
    const parentStep = createMockIfElseAction();

    expect(() =>
      insertStep({
        existingSteps: [parentStep],
        existingTrigger: null,
        insertedStep: createMockAction('new'),
        parentStepId: parentStep.id,
        nextStepId: connection.nextStepId,
        parentStepConnectionOptions: {
          connectedStepType: WorkflowActionType.IF_ELSE,
          settings: { branchId: connection.branchId },
        },
      }),
    ).toThrow('Cannot insert a step on branch');
  });

  it('rejects If/Else connection options on a different action type', () => {
    expect(() =>
      insertStep({
        existingSteps: [createMockAction('parent')],
        existingTrigger: null,
        insertedStep: createMockAction('new'),
        parentStepId: 'parent',
        parentStepConnectionOptions: {
          connectedStepType: WorkflowActionType.IF_ELSE,
          settings: { branchId: 'if' },
        },
      }),
    ).toThrow('Step parent is not an If/Else action');
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
