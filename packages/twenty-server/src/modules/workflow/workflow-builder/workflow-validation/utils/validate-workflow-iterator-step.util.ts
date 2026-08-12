import { isNonEmptyArray, isObject, isString } from '@sniptt/guards';
import { isDefined, isValidVariable } from 'twenty-shared/utils';
import {
  collectOutputSchemaVariablePaths,
  extractVariablesFromInput,
  parseVariablePath,
  resolveVariablePathInOutputSchema,
  TRIGGER_STEP_ID,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  type WorkflowIteratorAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const validateWorkflowIteratorStep = ({
  step,
  steps,
  trigger,
}: {
  step: WorkflowIteratorAction;
  steps: WorkflowAction[];
  trigger: WorkflowTrigger | null;
}): WorkflowValidationIssue[] => {
  const items = step.settings?.input?.items;

  if (!isString(items) || !isValidVariable(items)) {
    return [];
  }

  const [variable] = extractVariablesFromInput(items);

  if (!isDefined(variable)) {
    return [];
  }

  const [referencedStepId, ...propertyPath] = parseVariablePath(variable);

  if (!isDefined(referencedStepId)) {
    return [];
  }

  const outputSchema =
    referencedStepId === TRIGGER_STEP_ID
      ? trigger?.settings?.outputSchema
      : steps.find((currentStep) => currentStep.id === referencedStepId)
          ?.settings?.outputSchema;

  if (!isDefined(outputSchema) || !isObject(outputSchema)) {
    return [];
  }

  const resolved = resolveVariablePathInOutputSchema({
    schema: outputSchema,
    propertyPath,
  });

  if (resolved.found && resolved.type === 'array') {
    return [];
  }

  const arrayPathSuggestions = collectOutputSchemaVariablePaths(outputSchema)
    .filter(
      (path) =>
        resolveVariablePathInOutputSchema({
          schema: outputSchema,
          propertyPath: path.split('.'),
        }).type === 'array',
    )
    .map((path) => `${referencedStepId}.${path}`);

  const hint = isNonEmptyArray(arrayPathSuggestions)
    ? `Did you mean "{{${arrayPathSuggestions[0]}}}"?${
        arrayPathSuggestions.length > 1
          ? ` Other options: ${arrayPathSuggestions
              .slice(1)
              .map((suggestion) => `{{${suggestion}}}`)
              .join(', ')}.`
          : ''
      }`
    : undefined;

  return [
    {
      severity: 'error',
      code: 'ITERATOR_ITEMS_NOT_ARRAY',
      message: `Iterator step "${step.name ?? step.id}" must iterate over an array, but "{{${variable}}}" is not an array.`,
      stepId: step.id,
      path: variable,
      ...(isDefined(hint) ? { hint } : {}),
      ...(isNonEmptyArray(arrayPathSuggestions)
        ? { suggestions: arrayPathSuggestions }
        : {}),
    },
  ];
};
