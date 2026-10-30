import { isNumber, isString } from '@sniptt/guards';

import { SETU_AI_TASK_OPERATIONS } from '@/ai/constants/setu-ai-task-operations.const';
import { SETU_AI_TASK_STATUSES } from '@/ai/constants/setu-ai-task-statuses.const';
import { SETU_AI_TASK_STEP_OPERATIONS } from '@/ai/constants/setu-ai-task-step-operations.const';
import { SETU_AI_TASK_STEP_STATUSES } from '@/ai/constants/setu-ai-task-step-statuses.const';
import { SETU_INTERACTION_SCHEMA_VERSION } from '@/ai/constants/setu-interaction-schema-version.const';
import { type SetuAiTaskProjection } from '@/ai/types/SetuAiTaskProjection';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

export type ParsedSetuAiTaskProjection =
  | { status: 'valid'; task: SetuAiTaskProjection }
  | { status: 'unsupported-version' }
  | { status: 'invalid' };

const isOneOf = <TValue extends string>(
  values: readonly TValue[],
  value: unknown,
): value is TValue => isString(value) && values.includes(value as TValue);

const isValidStep = (step: unknown): boolean =>
  isPlainObject(step) &&
  isString(step.id) &&
  isString(step.companyName) &&
  isNumber(step.stateVersion) &&
  isOneOf(SETU_AI_TASK_STEP_STATUSES, step.status) &&
  Array.isArray(step.allowedOperations) &&
  step.allowedOperations.every((operation) =>
    isOneOf(SETU_AI_TASK_STEP_OPERATIONS, operation),
  ) &&
  (step.pendingInput === null ||
    (isPlainObject(step.pendingInput) &&
      isNumber(step.pendingInput.version) &&
      Array.isArray(step.pendingInput.fields))) &&
  (step.brief === null ||
    (isPlainObject(step.brief) &&
      Array.isArray(step.brief.sections) &&
      Array.isArray(step.brief.evidence)));

// The task card only offers controls the projection allows, so an unknown
// status or operation is refused rather than partly trusted.
export const parseSetuAiTaskProjection = (
  value: unknown,
): ParsedSetuAiTaskProjection => {
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
    isNumber(value.stateVersion) &&
    isOneOf(SETU_AI_TASK_STATUSES, value.status) &&
    Array.isArray(value.allowedOperations) &&
    value.allowedOperations.every((operation) =>
      isOneOf(SETU_AI_TASK_OPERATIONS, operation),
    ) &&
    Array.isArray(value.steps) &&
    value.steps.every(isValidStep);

  return isValid
    ? { status: 'valid', task: value as unknown as SetuAiTaskProjection }
    : { status: 'invalid' };
};
