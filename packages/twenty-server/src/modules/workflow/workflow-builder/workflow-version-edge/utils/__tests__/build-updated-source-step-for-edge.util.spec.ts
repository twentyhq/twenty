import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  buildSourceStepWithAddedEdge,
  buildSourceStepWithRemovedEdge,
} from 'src/modules/workflow/workflow-builder/workflow-version-edge/utils/build-updated-source-step-for-edge.util';
import { type WorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const ifElseStep: WorkflowIfElseAction = {
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
};

const branchOptions = (branchId: string) => ({
  connectedStepType: WorkflowActionType.IF_ELSE as const,
  settings: { branchId },
});

describe('If/Else edges', () => {
  it('adds and removes the target in the branch the options name', () => {
    const { updatedSourceStep: connectedStep } = buildSourceStepWithAddedEdge({
      sourceStep: ifElseStep,
      target: 'c',
      sourceConnectionOptions: branchOptions('else'),
    });

    expect(connectedStep.nextStepIds).toBeUndefined();
    expect(connectedStep).toMatchObject({
      settings: {
        input: {
          branches: [{ id: 'if' }, { id: 'else', nextStepIds: ['b', 'c'] }],
        },
      },
    });

    expect(
      buildSourceStepWithRemovedEdge({
        sourceStep: connectedStep,
        target: 'c',
        sourceConnectionOptions: branchOptions('else'),
      }).updatedSourceStep,
    ).toEqual(ifElseStep);
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
