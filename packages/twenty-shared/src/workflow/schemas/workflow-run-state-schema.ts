import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { z } from 'zod';
import { workflowActionSchema } from './workflow-action-schema';
import { workflowRunStateStepInfosSchema } from './workflow-run-state-step-infos-schema';
import { workflowTriggerSchema } from './workflow-trigger-schema';

const STEP_TYPES_WITHOUT_FIELDS_TO_UPDATE = ['CREATE_RECORD', 'UPSERT_RECORD'];

const dropStoredFieldsToUpdate = (step: unknown): unknown => {
  if (
    !isPlainObject(step) ||
    !STEP_TYPES_WITHOUT_FIELDS_TO_UPDATE.includes(String(step.type)) ||
    !isPlainObject(step.settings) ||
    !isPlainObject(step.settings.input)
  ) {
    return step;
  }

  const { fieldsToUpdate: _fieldsToUpdate, ...input } = step.settings.input;

  return { ...step, settings: { ...step.settings, input } };
};

export const workflowRunStateSchema = z.object({
  flow: z.object({
    trigger: workflowTriggerSchema,
    steps: z.array(
      z.preprocess(dropStoredFieldsToUpdate, workflowActionSchema),
    ),
  }),
  stepInfos: workflowRunStateStepInfosSchema,
  workflowRunError: z.any().optional(),
});
