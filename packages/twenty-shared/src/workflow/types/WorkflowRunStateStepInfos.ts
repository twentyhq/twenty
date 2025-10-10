import { type workflowRunStateStepInfoSchema } from '@/workflow/schemas/workflow-run-state-step-info-schema';
import { type workflowRunStateStepInfosSchema } from '@/workflow/schemas/workflow-run-state-step-infos-schema';
import type z from 'zod';

export enum StepStatus {
  NOT_STARTED = 'NOT_STARTED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  STOPPED = 'STOPPED',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  SKIPPED = 'SKIPPED',
}

export type WorkflowRunStepInfo = z.infer<
  typeof workflowRunStateStepInfoSchema
>;

export type WorkflowRunStepInfos = z.infer<
  typeof workflowRunStateStepInfosSchema
>;
