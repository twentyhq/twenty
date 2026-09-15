import {
  createMockCodeStep,
  createMockIfElseStep,
} from 'src/modules/workflow/workflow-executor/utils/create-mock-workflow-steps.util';
import { findParentSteps } from 'src/modules/workflow/workflow-executor/utils/find-parent-steps.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

describe('findParentSteps', () => {
  it('should find parent via nextStepIds', () => {
    const parent = createMockCodeStep('parent', ['child']);
    const child = createMockCodeStep('child');
    const steps = [parent, child];

    const result = findParentSteps({ step: child, steps });

    expect(result).toEqual([parent]);
  });

  it('should return empty array when no parent exists', () => {
    const stepA = createMockCodeStep('a');
    const stepB = createMockCodeStep('b');
    const steps = [stepA, stepB];

    const result = findParentSteps({ step: stepB, steps });

    expect(result).toEqual([]);
  });

  it('should find IF-ELSE parent via branch nextStepIds', () => {
    const branchChild = createMockCodeStep('branch-child');
    const ifElseStep = createMockIfElseStep('if-else', [
      { id: 'true-branch', nextStepIds: ['branch-child'] },
      { id: 'false-branch', nextStepIds: ['other-child'] },
    ]);
    const steps: WorkflowAction[] = [ifElseStep, branchChild];

    const result = findParentSteps({ step: branchChild, steps });

    expect(result).toEqual([ifElseStep]);
  });

  it('should find IF-ELSE parent for else branch child', () => {
    const elseChild = createMockCodeStep('else-child');
    const ifElseStep = createMockIfElseStep('if-else', [
      { id: 'true-branch', nextStepIds: ['true-child'] },
      { id: 'false-branch', nextStepIds: ['else-child'] },
    ]);
    const steps: WorkflowAction[] = [ifElseStep, elseChild];

    const result = findParentSteps({ step: elseChild, steps });

    expect(result).toEqual([ifElseStep]);
  });

  it('should find nested IF-ELSE parent via branch', () => {
    const nestedIfElse = createMockIfElseStep('nested-if-else', [
      { id: 'nested-true', nextStepIds: ['step-y'] },
      { id: 'nested-false', nextStepIds: ['step-z'] },
    ]);
    const outerIfElse = createMockIfElseStep('outer-if-else', [
      { id: 'outer-true', nextStepIds: ['step-x'] },
      { id: 'outer-false', nextStepIds: ['nested-if-else'] },
    ]);
    const steps: WorkflowAction[] = [outerIfElse, nestedIfElse];

    const result = findParentSteps({ step: nestedIfElse, steps });

    expect(result).toEqual([outerIfElse]);
  });

  it('should handle undefined steps gracefully', () => {
    const parent = createMockCodeStep('parent', ['child']);
    const child = createMockCodeStep('child');
    const steps = [parent, undefined as unknown as WorkflowAction, child];

    const result = findParentSteps({ step: child, steps });

    expect(result).toEqual([parent]);
  });

  it('should find multiple parents from different sources', () => {
    const child = createMockCodeStep('child');
    const standardParent = createMockCodeStep('standard', ['child']);
    const ifElseParent = createMockIfElseStep('if-else', [
      { id: 'branch', nextStepIds: ['child'] },
    ]);
    const steps: WorkflowAction[] = [standardParent, ifElseParent, child];

    const result = findParentSteps({ step: child, steps });

    expect(result).toEqual([standardParent, ifElseParent]);
  });
});
