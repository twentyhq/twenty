import { getParentSteps } from 'src/modules/workflow/workflow-executor/utils/get-parent-steps.util';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const makeStep = (step: Partial<WorkflowAction> & { id: string }) =>
  ({
    type: WorkflowActionType.CODE,
    nextStepIds: [],
    ...step,
  }) as unknown as WorkflowAction;

const makeIfElse = (
  id: string,
  branches: { nextStepIds: string[] }[],
): WorkflowAction =>
  ({
    id,
    type: WorkflowActionType.IF_ELSE,
    nextStepIds: [],
    settings: { input: { branches } },
  }) as unknown as WorkflowAction;

describe('getParentSteps', () => {
  it('detects a parent via step-level nextStepIds', () => {
    const parent = makeStep({ id: 'parent', nextStepIds: ['target'] });
    const target = makeStep({ id: 'target' });

    const result = getParentSteps(target, [parent, target]);

    expect(result.map((s) => s.id)).toEqual(['parent']);
  });

  it('detects a parent via IF_ELSE branch nextStepIds', () => {
    const ifElse = makeIfElse('if-else', [
      { nextStepIds: ['branch-a'] },
      { nextStepIds: ['target'] },
    ]);
    const target = makeStep({ id: 'target' });

    const result = getParentSteps(target, [ifElse, target]);

    expect(result.map((s) => s.id)).toEqual(['if-else']);
  });

  it('detects a convergence step reached from both a normal step and an IF_ELSE branch', () => {
    // if-else --(branch true)--> findStep --> target
    //         --(branch false)-----------------> target   (re-converges)
    const ifElse = makeIfElse('if-else', [
      { nextStepIds: ['find-step'] },
      { nextStepIds: ['target'] },
    ]);
    const findStep = makeStep({ id: 'find-step', nextStepIds: ['target'] });
    const target = makeStep({ id: 'target' });

    const result = getParentSteps(target, [ifElse, findStep, target]);

    expect(result.map((s) => s.id).sort()).toEqual(['find-step', 'if-else']);
  });

  it('returns an empty array when the step has no parents', () => {
    const orphan = makeStep({ id: 'orphan' });
    const other = makeStep({ id: 'other', nextStepIds: ['somewhere-else'] });

    expect(getParentSteps(orphan, [orphan, other])).toEqual([]);
  });
});
