import {
  createMockCodeStep,
  createMockIfElseStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { findChildStepIds } from 'src/modules/workflow/workflow-executor/utils/find-child-step-ids.util';

describe('findChildStepIds', () => {
  it('returns the next step ids of a regular step', () => {
    const step = createMockCodeStep('step-1', ['step-2', 'step-3']);

    expect(findChildStepIds({ step })).toEqual(
      expect.arrayContaining(['step-2', 'step-3']),
    );
    expect(findChildStepIds({ step })).toHaveLength(2);
  });

  it('returns an empty array when a step has no next step ids', () => {
    const step = createMockCodeStep('step-1');

    expect(findChildStepIds({ step })).toEqual([]);
  });

  it('returns the branch children of an if/else step', () => {
    const step = createMockIfElseStep('ifElse', [
      { id: 'ifBranch', filterGroupId: 'fg', nextStepIds: ['ifChild'] },
      { id: 'elseBranch', nextStepIds: ['elseChild'] },
    ]);

    expect(findChildStepIds({ step })).toEqual(
      expect.arrayContaining(['ifChild', 'elseChild']),
    );
    expect(findChildStepIds({ step })).toHaveLength(2);
  });

  it('deduplicates a step reachable through several branches', () => {
    const step = createMockIfElseStep('ifElse', [
      { id: 'ifBranch', filterGroupId: 'fg', nextStepIds: ['merge'] },
      { id: 'elseBranch', nextStepIds: ['merge'] },
    ]);

    expect(findChildStepIds({ step })).toEqual(['merge']);
  });

  it('ignores next step ids an if/else step carries outside its branches', () => {
    const step = createMockIfElseStep(
      'ifElse',
      [{ id: 'ifBranch', filterGroupId: 'fg', nextStepIds: ['ifChild'] }],
      ['strayChild'],
    );

    expect(findChildStepIds({ step })).toEqual(['ifChild']);
  });
});
