import { isDefined } from '@/utils';
import {
  type ValidatableWorkflow,
  type ValidatableWorkflowStep,
  type WorkflowValidationIssue,
  type WorkflowValidationResult,
} from '@/workflow/validation/types/workflow-validation.type';
import { buildWorkflowGraph } from '@/workflow/validation/utils/build-workflow-graph.util';
import { validateWorkflowGraph } from '@/workflow/validation/utils/validate-workflow-graph.util';
import { validateWorkflowStepParams } from '@/workflow/validation/utils/validate-workflow-step-params.util';
import { validateWorkflowVariableReferences } from '@/workflow/validation/utils/validate-workflow-variable-references.util';

const buildResult = (
  issues: WorkflowValidationIssue[],
): WorkflowValidationResult => {
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateWorkflowStructure = (
  workflow: ValidatableWorkflow,
): WorkflowValidationResult => {
  const issues: WorkflowValidationIssue[] = [];

  if (!isDefined(workflow.trigger)) {
    issues.push({
      severity: 'error',
      code: 'MISSING_TRIGGER',
      message: 'The workflow has no trigger.',
    });
  } else if (!isDefined(workflow.trigger.type)) {
    issues.push({
      severity: 'error',
      code: 'MISSING_TRIGGER_TYPE',
      message: 'The workflow trigger has no type.',
    });
  }

  const steps = workflow.steps ?? [];

  if (steps.length === 0) {
    issues.push({
      severity: 'error',
      code: 'NO_STEPS',
      message: 'The workflow has no steps.',
    });

    return buildResult(issues);
  }

  const stepsById = new Map<string, ValidatableWorkflowStep>(
    steps.map((step) => [step.id, step]),
  );

  const graph = buildWorkflowGraph(workflow);

  issues.push(...validateWorkflowGraph({ workflow, graph }));
  issues.push(...validateWorkflowStepParams(workflow));
  issues.push(
    ...validateWorkflowVariableReferences({
      workflow,
      graph,
      stepsById,
    }),
  );

  return buildResult(issues);
};
