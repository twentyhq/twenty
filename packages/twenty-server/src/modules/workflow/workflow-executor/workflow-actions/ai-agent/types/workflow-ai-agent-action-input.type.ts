import { type z } from 'zod';
import { type workflowAiAgentActionSettingsSchema } from 'twenty-shared/workflow';

export type WorkflowAiAgentActionInput = z.infer<
  typeof workflowAiAgentActionSettingsSchema
>['input'];
