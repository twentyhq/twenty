import { isNonEmptyString, isObject } from '@sniptt/guards';

const SETTINGS_EXPRESSION_DRAFT_LABELS: Record<string, string> = {
  validationRule: 'validation rule',
  formula: 'formula field',
  agentTriggerCondition: 'agent trigger condition',
};

const SETTINGS_EXPRESSION_DRAFT_MAX_LENGTH = 2000;

export const buildSettingsExpressionDraftContextLine = (
  draft: unknown,
): string | null => {
  if (!isObject(draft)) {
    return null;
  }

  const { kind, expression } = draft as Record<string, unknown>;
  const label = isNonEmptyString(kind)
    ? SETTINGS_EXPRESSION_DRAFT_LABELS[kind]
    : undefined;

  if (!isNonEmptyString(label) || !isNonEmptyString(expression)) {
    return null;
  }

  const trimmedExpression = expression.trim();

  if (!isNonEmptyString(trimmedExpression)) {
    return null;
  }

  const isTruncated =
    trimmedExpression.length > SETTINGS_EXPRESSION_DRAFT_MAX_LENGTH;
  const quotedExpression = JSON.stringify(
    trimmedExpression.slice(0, SETTINGS_EXPRESSION_DRAFT_MAX_LENGTH),
  );

  return `The user is editing an unsaved ${label}. Its current expression is ${quotedExpression}${isTruncated ? ' (truncated)' : ''}. When they ask to fix or explain "this" expression, they mean this draft, not a saved one.`;
};
