import { isDefined } from '@/utils';
import { WorkflowActionType } from '@/workflow/types/WorkflowActionType';
import {
  type IfElseStepInput,
  type IteratorStepInput,
  type ValidatableWorkflow,
  type ValidatableWorkflowStep,
  type WorkflowValidationIssue,
} from '@/workflow/validation/types/workflow-validation.type';
import { type WorkflowGraph } from '@/workflow/validation/utils/build-workflow-graph.util';
import { getStepInput } from '@/workflow/validation/utils/get-step-outgoing-step-ids.util';

export const validateWorkflowGraph = ({
  workflow,
  graph,
}: {
  workflow: ValidatableWorkflow;
  graph: WorkflowGraph;
}): WorkflowValidationIssue[] => {
  const issues: WorkflowValidationIssue[] = [];
  const steps = workflow.steps ?? [];
  const stepIds = new Set(steps.map((step) => step.id));

  const seenStepIds = new Set<string>();

  for (const step of steps) {
    if (seenStepIds.has(step.id)) {
      issues.push({
        severity: 'error',
        code: 'DUPLICATE_STEP_ID',
        message: `Duplicate step id "${step.id}". Every step id must be unique within the workflow.`,
        stepId: step.id,
      });
    }
    seenStepIds.add(step.id);
  }

  const triggerNextStepIds = (workflow.trigger?.nextStepIds ?? []).filter(
    isDefined,
  );

  if (steps.length > 0 && triggerNextStepIds.length === 0) {
    issues.push({
      severity: 'error',
      code: 'TRIGGER_HAS_NO_NEXT_STEP',
      message: `The trigger is not connected to any step. The trigger must have a "nextStepIds" array pointing to the first step (e.g. nextStepIds: ["${steps[0].id}"]). If you used edges, also set trigger.nextStepIds.`,
    });
  }

  for (const triggerNextStepId of triggerNextStepIds) {
    if (!stepIds.has(triggerNextStepId)) {
      issues.push({
        severity: 'error',
        code: 'DANGLING_REFERENCE',
        message: `The trigger references a non-existent step "${triggerNextStepId}".`,
      });
    }
  }

  for (const step of steps) {
    for (const outgoingStepId of graph.childrenByStepId.get(step.id) ?? []) {
      if (!stepIds.has(outgoingStepId)) {
        issues.push({
          severity: 'error',
          code: 'DANGLING_REFERENCE',
          message: `Step "${step.name ?? step.id}" references a non-existent step "${outgoingStepId}".`,
          stepId: step.id,
        });
      }
    }

    issues.push(...validateBranchingStep(step));
  }

  for (const step of steps) {
    if (!graph.reachableFromTrigger.has(step.id)) {
      issues.push({
        severity: 'error',
        code: 'UNREACHABLE_STEP',
        message: `Step "${step.name ?? step.id}" is not reachable from the trigger. Ensure a chain of nextStepIds connects the trigger to this step. Check that the preceding step includes this step's id ("${step.id}") in its nextStepIds array.`,
        stepId: step.id,
      });
    }
  }

  return issues;
};

const validateBranchingStep = (
  step: ValidatableWorkflowStep,
): WorkflowValidationIssue[] => {
  const issues: WorkflowValidationIssue[] = [];
  const input = getStepInput(step);

  if (step.type === WorkflowActionType.IF_ELSE) {
    const branchList = (input as Partial<IfElseStepInput> | undefined)
      ?.branches;
    const branches = Array.isArray(branchList) ? branchList : [];

    if (branches.length < 2) {
      issues.push({
        severity: 'warning',
        code: 'IF_ELSE_INSUFFICIENT_BRANCHES',
        message: `If/Else step "${step.name ?? step.id}" should have at least two branches (a condition branch and an else branch).`,
        stepId: step.id,
      });
    }

    for (const branch of branches) {
      const branchNextStepIds = branch?.nextStepIds;

      if (!Array.isArray(branchNextStepIds) || branchNextStepIds.length === 0) {
        issues.push({
          severity: 'error',
          code: 'IF_ELSE_BRANCH_HAS_NO_NEXT_STEP',
          message: `A branch of If/Else step "${step.name ?? step.id}" is not connected to any step.`,
          stepId: step.id,
        });
      }
    }
  }

  if (step.type === WorkflowActionType.ITERATOR) {
    const iteratorInput = input as Partial<IteratorStepInput> | undefined;
    const items = iteratorInput?.items;
    const hasConfiguredItems =
      (typeof items === 'string' && items.length > 0) ||
      (Array.isArray(items) && items.length > 0);
    const initialLoopStepIds = iteratorInput?.initialLoopStepIds;
    const hasLoopBody =
      Array.isArray(initialLoopStepIds) && initialLoopStepIds.length > 0;

    if (hasConfiguredItems && !hasLoopBody) {
      issues.push({
        severity: 'error',
        code: 'ITERATOR_MISSING_LOOP_BODY',
        message: `Iterator step "${step.name ?? step.id}" has items to iterate over but no steps inside the loop.`,
        stepId: step.id,
      });
    }
  }

  return issues;
};
