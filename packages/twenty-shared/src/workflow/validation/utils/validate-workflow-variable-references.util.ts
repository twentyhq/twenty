import { isNonEmptyArray, isObject } from '@sniptt/guards';

import { isDefined } from '@/utils';
import { TRIGGER_STEP_ID } from '@/workflow/constants/TriggerStepId';
import { parseVariablePath } from '@/workflow/utils/variable-path.util';
import {
  type ValidatableWorkflow,
  type ValidatableWorkflowStep,
  type WorkflowValidationIssue,
} from '@/workflow/validation/types/workflow-validation.type';
import { type WorkflowGraph } from '@/workflow/validation/utils/build-workflow-graph.util';
import { extractVariablesFromInput } from '@/workflow/validation/utils/extract-variables-from-input.util';
import { getVariablePathSuggestions } from '@/workflow/validation/utils/get-variable-path-suggestions.util';
import {
  collectOutputSchemaVariablePaths,
  resolveVariablePathInOutputSchema,
} from '@/workflow/workflow-schema/utils/resolveVariablePathInOutputSchema';

export const validateWorkflowVariableReferences = ({
  workflow,
  graph,
  stepsById,
}: {
  workflow: ValidatableWorkflow;
  graph: WorkflowGraph;
  stepsById: Map<string, ValidatableWorkflowStep>;
}): WorkflowValidationIssue[] => {
  const issues: WorkflowValidationIssue[] = [];
  const stepIds = new Set(workflow.steps?.map((step) => step.id) ?? []);

  for (const step of workflow.steps ?? []) {
    const variables = extractVariablesFromInput(step.settings?.input);
    const ancestors = graph.ancestorsByStepId.get(step.id) ?? new Set<string>();

    for (const variable of variables) {
      const pathSegments = parseVariablePath(variable);
      const referencedStepId = pathSegments[0];

      if (!isDefined(referencedStepId)) {
        issues.push({
          severity: 'error',
          code: 'VARIABLE_INVALID_PATH',
          message: `Step "${step.name ?? step.id}" has a variable "{{${variable}}}" with an invalid path. Variable references must start with a step ID, e.g. "{{stepId.property}}".`,
          stepId: step.id,
          path: variable,
        });
        continue;
      }

      const isTriggerReference = referencedStepId === TRIGGER_STEP_ID;

      if (!isTriggerReference && !stepIds.has(referencedStepId)) {
        issues.push({
          severity: 'error',
          code: 'VARIABLE_UNKNOWN_STEP',
          message: `Step "${step.name ?? step.id}" references variable "{{${variable}}}" from an unknown step "${referencedStepId}".`,
          stepId: step.id,
          path: variable,
        });
        continue;
      }

      const isSelfReference = referencedStepId === step.id;

      // The trigger always runs before every step, so a trigger reference is
      // upstream by definition even when it is not present in the ancestor set.
      if (
        !isTriggerReference &&
        !isSelfReference &&
        !ancestors.has(referencedStepId)
      ) {
        const referencedStep = stepsById.get(referencedStepId);
        const referencedStepLabel = referencedStep?.name ?? referencedStepId;

        issues.push({
          severity: 'error',
          code: 'VARIABLE_NOT_UPSTREAM',
          message: `Step "${step.name ?? step.id}" references variable "{{${variable}}}" from step "${referencedStepLabel}", which does not run before it. Ensure step "${referencedStepLabel}" is an ancestor (connected via nextStepIds chain from the trigger, before this step).`,
          stepId: step.id,
          path: variable,
        });
        continue;
      }

      issues.push(
        ...validateVariablePathAgainstOutputSchema({
          step,
          variable,
          pathSegments,
          referencedStepId,
          isTriggerReference,
          trigger: workflow.trigger,
          stepsById,
        }),
      );
    }
  }

  return issues;
};

const validateVariablePathAgainstOutputSchema = ({
  step,
  variable,
  pathSegments,
  referencedStepId,
  isTriggerReference,
  trigger,
  stepsById,
}: {
  step: ValidatableWorkflowStep;
  variable: string;
  pathSegments: string[];
  referencedStepId: string;
  isTriggerReference: boolean;
  trigger: ValidatableWorkflow['trigger'];
  stepsById: Map<string, ValidatableWorkflowStep>;
}): WorkflowValidationIssue[] => {
  const propertyPath = pathSegments.slice(1);

  if (propertyPath.length === 0) {
    return [];
  }

  const outputSchema = isTriggerReference
    ? trigger?.settings?.outputSchema
    : stepsById.get(referencedStepId)?.settings?.outputSchema;

  const isEmptyOutputSchema =
    isDefined(outputSchema) &&
    isObject(outputSchema) &&
    !Array.isArray(outputSchema) &&
    Object.keys(outputSchema).length === 0;

  if (!isDefined(outputSchema) || isEmptyOutputSchema) {
    return [];
  }

  const resolved = resolveVariablePathInOutputSchema({
    schema: outputSchema,
    propertyPath,
  });

  if (!resolved.found) {
    const suggestions = getVariablePathSuggestions({
      schema: outputSchema,
      propertyPath,
      referencedStepId,
    });

    const availablePaths = collectAvailablePaths(
      outputSchema,
      referencedStepId,
    );

    const hint = isNonEmptyArray(suggestions)
      ? `Did you mean "{{${suggestions[0]}}}"?${
          suggestions.length > 1
            ? ` Other options: ${suggestions
                .slice(1)
                .map((suggestion) => `{{${suggestion}}}`)
                .join(', ')}.`
            : ''
        }`
      : isNonEmptyArray(availablePaths)
        ? `Available paths: ${availablePaths.map((path) => `{{${path}}}`).join(', ')}.`
        : undefined;

    return [
      {
        severity: 'error',
        code: 'VARIABLE_PATH_NOT_FOUND',
        message: `Step "${step.name ?? step.id}" references variable "{{${variable}}}" but the path "${propertyPath.join('.')}" was not found in the output of step "${referencedStepId}".`,
        stepId: step.id,
        path: variable,
        ...(isDefined(hint) ? { hint } : {}),
        ...(isNonEmptyArray(suggestions) ? { suggestions } : {}),
        ...(isNonEmptyArray(availablePaths) ? { availablePaths } : {}),
      },
    ];
  }

  return [];
};

const MAX_AVAILABLE_PATHS = 20;

const collectAvailablePaths = (
  outputSchema: unknown,
  referencedStepId: string,
): string[] =>
  collectOutputSchemaVariablePaths(outputSchema)
    .slice(0, MAX_AVAILABLE_PATHS)
    .map((path) => `${referencedStepId}.${path}`);
