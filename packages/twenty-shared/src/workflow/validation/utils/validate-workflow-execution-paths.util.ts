import { isDefined } from '@/utils/validation/isDefined';
import { WorkflowActionType } from '@/workflow/types/WorkflowActionType';
import { isIteratorStepInput } from '@/workflow/validation/guards/isIteratorStepInput';
import {
  type ValidatableWorkflow,
  type WorkflowValidationIssue,
} from '@/workflow/validation/types/WorkflowValidation';
import { type WorkflowGraph } from '@/workflow/validation/utils/build-workflow-graph.util';

export const validateWorkflowExecutionPaths = ({
  workflow,
  graph,
}: {
  workflow: ValidatableWorkflow;
  graph: WorkflowGraph;
}): WorkflowValidationIssue[] => {
  const issues: WorkflowValidationIssue[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stepsById = new Map(
    (workflow.steps ?? []).map((step) => [step.id, step]),
  );
  const visit = (
    id: string,
    enclosingIterators: string[] = [],
    sourceId?: string,
  ): void => {
    const enclosingIterator = enclosingIterators[enclosingIterators.length - 1];
    if (visiting.has(id)) {
      if (id !== sourceId && enclosingIterator === id) return;
      issues.push({
        severity: 'error',
        code: 'WORKFLOW_CYCLE',
        stepId: id,
        message: `Workflow contains a cycle at step ${id}`,
      });
      return;
    }
    const step = stepsById.get(id);
    const visitKey = `${id}:${enclosingIterators.join(',')}`;
    if (!isDefined(step) || visited.has(visitKey)) return;
    visiting.add(id);
    if (isIteratorStepInput(step)) {
      (step.settings.input.initialLoopStepIds ?? []).forEach((nextId) =>
        visit(nextId, [...enclosingIterators, id], id),
      );
    }
    const destinations =
      step.type === WorkflowActionType.ITERATOR
        ? (step.nextStepIds ?? [])
        : (graph.childrenByStepId.get(id) ?? []);
    if (isDefined(enclosingIterator) && destinations.length === 0) {
      issues.push({
        severity: 'error',
        code: 'ITERATOR_MISSING_RETURN',
        stepId: id,
        message: `Loop body step ${id} must return to iterator ${enclosingIterator}`,
      });
    }
    destinations.forEach((nextId) => visit(nextId, enclosingIterators, id));
    visiting.delete(id);
    visited.add(visitKey);
  };
  workflow.trigger?.nextStepIds?.forEach((id) => visit(id));
  return issues;
};
