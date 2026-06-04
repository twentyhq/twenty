import { type workflowRunStepLogSchema } from '@/workflow/schemas/workflow-run-step-log-schema';
import type z from 'zod';

export type WorkflowRunStepLog = z.infer<typeof workflowRunStepLogSchema>;

export type WorkflowRunStepLogs = Record<string, WorkflowRunStepLog>;

export type AiAgentStepLogDetails = Extract<
  WorkflowRunStepLog['details'],
  { type: 'AI_AGENT' }
>;

export type AiToolCallLog = AiAgentStepLogDetails['toolCalls'][number];
