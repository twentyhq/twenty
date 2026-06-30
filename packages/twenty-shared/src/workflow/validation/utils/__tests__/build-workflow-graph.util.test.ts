import { TRIGGER_STEP_ID } from '@/workflow/constants/TriggerStepId';
import {
  type ValidatableWorkflow,
  type ValidatableWorkflowStep,
} from '@/workflow/validation/types/workflow-validation.type';
import { buildWorkflowGraph } from '../build-workflow-graph.util';

const buildStep = (
  id: string,
  nextStepIds: string[] = [],
): ValidatableWorkflowStep => ({ id, type: 'CODE', nextStepIds });

const ancestorsOf = (
  graph: ReturnType<typeof buildWorkflowGraph>,
  stepId: string,
): string[] => [...(graph.ancestorsByStepId.get(stepId) ?? [])];

describe('buildWorkflowGraph', () => {
  it('should map trigger children, reachability and ancestors for a linear flow', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['s1'] },
      steps: [buildStep('s1', ['s2']), buildStep('s2')],
    };

    const graph = buildWorkflowGraph(workflow);

    expect(graph.childrenByStepId.get(TRIGGER_STEP_ID)).toEqual(['s1']);
    expect(graph.reachableFromTrigger.has('s1')).toBe(true);
    expect(graph.reachableFromTrigger.has('s2')).toBe(true);
    expect(ancestorsOf(graph, 's1')).toEqual([TRIGGER_STEP_ID]);
    expect(ancestorsOf(graph, 's2')).toEqual(
      expect.arrayContaining([TRIGGER_STEP_ID, 's1']),
    );
  });

  it('should not mark disconnected steps as reachable', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['s1'] },
      steps: [buildStep('s1'), buildStep('orphan')],
    };

    const graph = buildWorkflowGraph(workflow);

    expect(graph.reachableFromTrigger.has('s1')).toBe(true);
    expect(graph.reachableFromTrigger.has('orphan')).toBe(false);
  });

  it('should handle a trigger without nextStepIds', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL' },
      steps: [buildStep('s1')],
    };

    const graph = buildWorkflowGraph(workflow);

    expect(graph.childrenByStepId.get(TRIGGER_STEP_ID)).toEqual([]);
    expect(graph.reachableFromTrigger.has('s1')).toBe(false);
  });

  it('should not loop forever on cyclic graphs', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'MANUAL', nextStepIds: ['s1'] },
      steps: [buildStep('s1', ['s2']), buildStep('s2', ['s1'])],
    };

    const graph = buildWorkflowGraph(workflow);

    expect(graph.reachableFromTrigger.has('s1')).toBe(true);
    expect(graph.reachableFromTrigger.has('s2')).toBe(true);
    expect(ancestorsOf(graph, 's1')).toEqual(
      expect.arrayContaining([TRIGGER_STEP_ID, 's1', 's2']),
    );
  });
});
