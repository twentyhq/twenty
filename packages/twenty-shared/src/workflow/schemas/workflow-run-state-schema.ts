import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isString } from '@sniptt/guards';
import { z } from 'zod';
import { workflowActionSchema } from './workflow-action-schema';
import { workflowRunStateStepInfosSchema } from './workflow-run-state-step-infos-schema';
import { workflowTriggerSchema } from './workflow-trigger-schema';

// Runs keep the steps they ran with, so a find records step may still hold the GraphQL order or sorts without an id
const dropStoredFindRecordsGqlOrderBy = (step: unknown): unknown => {
  if (
    !isPlainObject(step) ||
    step.type !== 'FIND_RECORDS' ||
    !isPlainObject(step.settings) ||
    !isPlainObject(step.settings.input) ||
    !isPlainObject(step.settings.input.orderBy)
  ) {
    return step;
  }

  const { gqlOperationOrderBy: _gqlOperationOrderBy, ...orderBy } =
    step.settings.input.orderBy;

  if (Array.isArray(orderBy.recordSorts)) {
    orderBy.recordSorts = orderBy.recordSorts.map((recordSort, index) =>
      isPlainObject(recordSort) && !isString(recordSort.id)
        ? { ...recordSort, id: `${String(step.id)}-${index}` }
        : recordSort,
    );
  }

  return {
    ...step,
    settings: {
      ...step.settings,
      input: { ...step.settings.input, orderBy },
    },
  };
};

export const workflowRunStateSchema = z.object({
  flow: z.object({
    trigger: workflowTriggerSchema,
    steps: z.array(
      z.preprocess(dropStoredFindRecordsGqlOrderBy, workflowActionSchema),
    ),
  }),
  stepInfos: workflowRunStateStepInfosSchema,
  workflowRunError: z.any().optional(),
});
