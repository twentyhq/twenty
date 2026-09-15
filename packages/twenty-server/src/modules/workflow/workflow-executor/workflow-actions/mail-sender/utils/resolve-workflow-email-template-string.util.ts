import { evalFromContext } from 'twenty-shared/utils';

import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';

const WORKFLOW_VARIABLE_PATTERN = /\{\{[^{}]+\}\}/g;

const stringifyResolvedValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return typeof value === 'object' ? JSON.stringify(value) : String(value);
};

export const resolveWorkflowEmailTemplateString = (
  value: string,
  context: Record<string, unknown>,
  { escapeValues }: { escapeValues: boolean },
): string =>
  value.replace(WORKFLOW_VARIABLE_PATTERN, (variable) => {
    const resolvedValue = stringifyResolvedValue(
      evalFromContext(variable, context),
    );

    return escapeValues ? escapeHtml(resolvedValue) : resolvedValue;
  });
