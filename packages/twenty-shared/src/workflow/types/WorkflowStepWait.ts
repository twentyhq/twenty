import { type workflowStepWaitSchema } from '@/workflow/schemas/workflow-step-wait-schema';
import type z from 'zod';

export type WorkflowStepWait = z.infer<typeof workflowStepWaitSchema>;
