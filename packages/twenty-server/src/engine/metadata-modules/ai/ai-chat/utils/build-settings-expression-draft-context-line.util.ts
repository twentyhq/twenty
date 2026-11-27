import { isNonEmptyString, isObject } from '@sniptt/guards';

import { type SettingsExpressionDraftKind } from 'src/engine/metadata-modules/ai/ai-agent/types/browsing-context.type';

const SETTINGS_EXPRESSION_DRAFT_LABELS: Record<
  SettingsExpressionDraftKind,
  string
> = {
  validationRule: 'validation rule',
  formula: 'formula field',
  agentTriggerCondition: 'agent trigger condition',
};

const SETTINGS_EXPRESSION_DRAFT_MAX_LENGTH = 2000;

const isSettingsExpressionDraftKind = (
  kind: unknown,
): kind is SettingsExpressionDraftKind =>
  isNonEmptyString(kind) &&
  Object.keys(SETTINGS_EXPRESSION_DRAFT_LABELS).includes(kind);

export const buildSettingsExpressionDraftContextLine = (
  draft: unknown,
): string | null => {
  if (!isObject(draft) || !('kind' in draft) || !('expression' in draft)) {
    return null;
  }

  const { kind, expression } = draft;

  if (!isSettingsExpressionDraftKind(kind) || !isNonEmptyString(expression)) {
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

  return `The user is editing a ${SETTINGS_EXPRESSION_DRAFT_LABELS[kind]} on this page, possibly not saved yet. Its current expression in the editor is ${quotedExpression}${isTruncated ? ' (truncated)' : ''}. When they ask to fix or explain "this" expression, they mean this text.`;
};
