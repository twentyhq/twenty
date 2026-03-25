import { z } from 'zod';
import { workflowRunStateStepInfoSchema } from './workflow-run-state-step-info-schema';

export const workflowRunStateStepInfosSchema = z.record(
  z.string(),
  workflowRunStateStepInfoSchema,
);
