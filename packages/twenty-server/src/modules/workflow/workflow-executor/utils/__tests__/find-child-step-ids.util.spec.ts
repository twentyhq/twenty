import { findChildStepIds } from 'src/modules/workflow/workflow-executor/utils/find-child-step-ids.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

describe('findChildStepIds', () => {
  it('returns the next step ids of a regular step', () => {
    const step = {
      id: 'step-1',
      type: 'RECORD_UPDATE',
      nextStepIds: ['step-2', 'step-3'],
    } as unknown as WorkflowAction;

    expect(findChildStepIds({ step })).toEqual(['step-2', 'step-3']);
  });

  it('returns an empty array when a step has no next step ids', () => {
    const step = { id: 'step-1', type: 'RECORD_UPDATE' } as WorkflowAction;

    expect(findChildStepIds({ step })).toEqual([]);
  });

  it('returns the branch children of an if/else step', () => {
    const step = {
      id: 'ifElse',
      type: 'IF_ELSE',
      nextStepIds: [],
      settings: {
        input: {
          branches: [
            { id: 'ifBranch', nextStepIds: ['ifChild'] },
            { id: 'elseBranch', nextStepIds: ['elseChild'] },
          ],
        },
      },
    } as unknown as WorkflowAction;

    expect(findChildStepIds({ step })).toEqual(['ifChild', 'elseChild']);
  });

  it('deduplicates a step reachable through several edges', () => {
    const step = {
      id: 'ifElse',
      type: 'IF_ELSE',
      nextStepIds: ['merge'],
      settings: {
        input: {
          branches: [
            { id: 'ifBranch', nextStepIds: ['merge'] },
            { id: 'elseBranch', nextStepIds: ['merge'] },
          ],
        },
      },
    } as unknown as WorkflowAction;

    expect(findChildStepIds({ step })).toEqual(['merge']);
  });
});
