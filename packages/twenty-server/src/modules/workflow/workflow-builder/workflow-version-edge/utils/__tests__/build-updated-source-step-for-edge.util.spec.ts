import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  buildSourceStepWithAddedEdge,
  buildSourceStepWithRemovedEdge,
} from 'src/modules/workflow/workflow-builder/workflow-version-edge/utils/build-updated-source-step-for-edge.util';
import { type WorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

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
    errorHandlingOptions: {
      continueOnFailure: { value: false },
      retryOnFailure: { value: 0 },
    },
  },
} as WorkflowIfElseAction;

const branchOptions = (branchId: string) => ({
  connectedStepType: WorkflowActionType.IF_ELSE as const,
  settings: { branchId },
});

describe('If/Else edges', () => {
  it('adds and removes the target in the branch the options name', () => {
    const added = buildSourceStepWithAddedEdge({
      sourceStep: ifElseStep,
      target: 'c',
      sourceConnectionOptions: branchOptions('else'),
    }).updatedSourceStep as WorkflowIfElseAction;

    expect(added.nextStepIds).toBeUndefined();
    expect(added.settings.input.branches[1].nextStepIds).toEqual(['b', 'c']);

    const removed = buildSourceStepWithRemovedEdge({
      sourceStep: added,
      target: 'c',
      sourceConnectionOptions: branchOptions('else'),
    }).updatedSourceStep as WorkflowIfElseAction;

    expect(removed.settings.input.branches[1].nextStepIds).toEqual(['b']);
  });

  it('refuses an edge that names no branch, listing the branch ids', () => {
    expect(() =>
      buildSourceStepWithAddedEdge({ sourceStep: ifElseStep, target: 'c' }),
    ).toThrow('where branchId is one of: "if", "else"');
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
});
