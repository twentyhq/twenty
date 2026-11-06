import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  buildSourceStepWithAddedEdge,
  buildSourceStepWithRemovedEdge,
} from 'src/modules/workflow/workflow-builder/workflow-version-edge/utils/build-updated-source-step-for-edge.util';
import {
  type WorkflowAction,
  type WorkflowIfElseAction,
  type WorkflowIteratorAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const ERROR_HANDLING_OPTIONS = {
  continueOnFailure: { value: false },
  retryOnFailure: { value: 0 },
};

const ifElseStep = {
  id: 'if-else',
  name: 'If/Else',
  type: WorkflowActionType.IF_ELSE,
  valid: true,
  settings: {
    input: {
      stepFilterGroups: [],
      stepFilters: [],
      branches: [
        { id: 'if', filterGroupId: 'group', nextStepIds: ['a'] },
        { id: 'else', nextStepIds: ['b'] },
      ],
    },
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
} as WorkflowIfElseAction;

const iteratorStep = {
  id: 'iterator',
  name: 'Loop',
  type: WorkflowActionType.ITERATOR,
  valid: true,
  nextStepIds: ['after'],
  settings: {
    input: { items: ['a'], initialLoopStepIds: ['body'] },
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
} as WorkflowIteratorAction;

const emptyStep = {
  id: 'empty',
  name: 'Empty',
  type: WorkflowActionType.EMPTY,
  valid: true,
  nextStepIds: ['a'],
  settings: {
    input: {},
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
} as WorkflowAction;

const branchOptions = (branchId: string) => ({
  connectedStepType: WorkflowActionType.IF_ELSE as const,
  settings: { branchId },
});

describe('buildSourceStepWithAddedEdge', () => {
  it('adds the target to the If/Else branch the options name', () => {
    const { updatedSourceStep, shouldPersist } = buildSourceStepWithAddedEdge({
      sourceStep: ifElseStep,
      target: 'c',
      sourceConnectionOptions: branchOptions('else'),
    });

    expect(shouldPersist).toBe(true);
    expect(updatedSourceStep.nextStepIds).toBeUndefined();
    expect(
      (updatedSourceStep as WorkflowIfElseAction).settings.input.branches,
    ).toEqual([
      { id: 'if', filterGroupId: 'group', nextStepIds: ['a'] },
      { id: 'else', nextStepIds: ['b', 'c'] },
    ]);
  });

  it('does not persist a target the branch already has', () => {
    expect(
      buildSourceStepWithAddedEdge({
        sourceStep: ifElseStep,
        target: 'b',
        sourceConnectionOptions: branchOptions('else'),
      }),
    ).toEqual({ updatedSourceStep: ifElseStep, shouldPersist: false });
  });

  it.each([
    ['no options', undefined],
    [
      'iterator options',
      {
        connectedStepType: WorkflowActionType.ITERATOR as const,
        settings: { isConnectedToLoop: false },
      },
    ],
  ])('refuses an If/Else edge with %s', (_, sourceConnectionOptions) => {
    expect(() =>
      buildSourceStepWithAddedEdge({
        sourceStep: ifElseStep,
        target: 'c',
        sourceConnectionOptions,
      }),
    ).toThrow(
      'Connect If/Else step \'if-else\' through one of its branches with connection options { connectedStepType: "IF_ELSE", settings: { branchId } }, where branchId is one of: "if", "else"',
    );
  });

  it('refuses a branch the If/Else does not have', () => {
    expect(() =>
      buildSourceStepWithAddedEdge({
        sourceStep: ifElseStep,
        target: 'c',
        sourceConnectionOptions: branchOptions('ghost'),
      }),
    ).toThrow("Branch 'ghost' not found");
  });

  it('refuses If/Else options on another step type', () => {
    expect(() =>
      buildSourceStepWithAddedEdge({
        sourceStep: emptyStep,
        target: 'c',
        sourceConnectionOptions: branchOptions('if'),
      }),
    ).toThrow("Source step 'empty' is not an If/Else step");
  });

  it('adds the target to the loop body or after the loop', () => {
    const intoLoop = buildSourceStepWithAddedEdge({
      sourceStep: iteratorStep,
      target: 'c',
      sourceConnectionOptions: {
        connectedStepType: WorkflowActionType.ITERATOR,
        settings: { isConnectedToLoop: true },
      },
    }).updatedSourceStep as WorkflowIteratorAction;
    const afterLoop = buildSourceStepWithAddedEdge({
      sourceStep: iteratorStep,
      target: 'c',
      sourceConnectionOptions: {
        connectedStepType: WorkflowActionType.ITERATOR,
        settings: { isConnectedToLoop: false },
      },
    }).updatedSourceStep as WorkflowIteratorAction;

    expect(intoLoop.settings.input.initialLoopStepIds).toEqual(['body', 'c']);
    expect(intoLoop.nextStepIds).toEqual(['after']);
    expect(afterLoop.settings.input.initialLoopStepIds).toEqual(['body']);
    expect(afterLoop.nextStepIds).toEqual(['after', 'c']);
  });

  it('adds the target to the next steps of another step', () => {
    expect(
      buildSourceStepWithAddedEdge({ sourceStep: emptyStep, target: 'c' })
        .updatedSourceStep.nextStepIds,
    ).toEqual(['a', 'c']);
  });
});

describe('buildSourceStepWithRemovedEdge', () => {
  it('removes the target from the If/Else branch the options name', () => {
    const { updatedSourceStep, shouldPersist } = buildSourceStepWithRemovedEdge(
      {
        sourceStep: ifElseStep,
        target: 'b',
        sourceConnectionOptions: branchOptions('else'),
      },
    );

    expect(shouldPersist).toBe(true);
    expect(
      (updatedSourceStep as WorkflowIfElseAction).settings.input.branches[1],
    ).toEqual({ id: 'else', nextStepIds: [] });
  });

  it('refuses to remove an If/Else edge without a branch', () => {
    expect(() =>
      buildSourceStepWithRemovedEdge({ sourceStep: ifElseStep, target: 'b' }),
    ).toThrow('through one of its branches');
  });

  it('does not persist the removal of a missing target', () => {
    expect(
      buildSourceStepWithRemovedEdge({ sourceStep: emptyStep, target: 'c' }),
    ).toEqual({ updatedSourceStep: emptyStep, shouldPersist: false });
  });
});
