import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { z } from 'zod';
import { workflowActionSchema } from './workflow-action-schema';
import { workflowRunStateStepInfosSchema } from './workflow-run-state-step-infos-schema';
import { workflowTriggerSchema } from './workflow-trigger-schema';

const STEP_TYPES_WITH_STRICT_INPUT = ['CREATE_RECORD', 'UPSERT_RECORD'];

const DECLARED_INPUT_KEYS = ['objectName', 'objectRecord'];

const dropStoredUndeclaredInputKeys = (step: unknown): unknown => {
  if (
    !isPlainObject(step) ||
    !STEP_TYPES_WITH_STRICT_INPUT.includes(String(step.type)) ||
    !isPlainObject(step.settings) ||
    !isPlainObject(step.settings.input)
  ) {
    return step;
  }

  const input = Object.fromEntries(
    Object.entries(step.settings.input).filter(([key]) =>
      DECLARED_INPUT_KEYS.includes(key),
    ),
  );

  return { ...step, settings: { ...step.settings, input } };
};

export const workflowRunStateSchema = z.object({
  flow: z.object({
    trigger: workflowTriggerSchema,
    steps: z.array(
      z.preprocess(dropStoredUndeclaredInputKeys, workflowActionSchema),
    ),
  }),
  stepInfos: workflowRunStateStepInfosSchema,
  workflowRunError: z.any().optional(),
});
