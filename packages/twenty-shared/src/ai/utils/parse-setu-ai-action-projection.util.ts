import { isNumber, isString } from '@sniptt/guards';

import { SETU_AI_ACTION_KINDS } from '@/ai/constants/setu-ai-action-kinds.const';
import { SETU_AI_ACTION_OPERATIONS } from '@/ai/constants/setu-ai-action-operations.const';
import { SETU_AI_ACTION_STATUSES } from '@/ai/constants/setu-ai-action-statuses.const';
import { SETU_INTERACTION_SCHEMA_VERSION } from '@/ai/constants/setu-interaction-schema-version.const';
import { type SetuAiActionProjection } from '@/ai/types/SetuAiActionProjection';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

export type ParsedSetuAiActionProjection =
  | { status: 'valid'; action: SetuAiActionProjection }
  | { status: 'unsupported-version' }
  | { status: 'invalid' };

const isOneOf = <TValue extends string>(
  values: readonly TValue[],
  value: unknown,
): value is TValue => isString(value) && values.includes(value as TValue);

// Clients only render controls the projection allows, so a projection with an
// unknown status, kind or operation is refused rather than partly trusted.
export const parseSetuAiActionProjection = (
  value: unknown,
): ParsedSetuAiActionProjection => {
  if (!isPlainObject(value)) {
    return { status: 'invalid' };
  }

  if (
    isNumber(value.schemaVersion) &&
    value.schemaVersion > SETU_INTERACTION_SCHEMA_VERSION
  ) {
    return { status: 'unsupported-version' };
  }

  const isValid =
    value.schemaVersion === SETU_INTERACTION_SCHEMA_VERSION &&
    isString(value.id) &&
    isNumber(value.revision) &&
    isNumber(value.stateVersion) &&
    isOneOf(SETU_AI_ACTION_STATUSES, value.status) &&
    isOneOf(SETU_AI_ACTION_KINDS, value.kind) &&
    isPlainObject(value.payload) &&
    Array.isArray(value.allowedOperations) &&
    value.allowedOperations.every((operation) =>
      isOneOf(SETU_AI_ACTION_OPERATIONS, operation),
    );

  return isValid
    ? { status: 'valid', action: value as unknown as SetuAiActionProjection }
    : { status: 'invalid' };
};
