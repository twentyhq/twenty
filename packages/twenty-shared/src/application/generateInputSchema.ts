import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';

import { aiRunScopeSchema } from '@/ai/schemas/ai-run-scope-schema';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { agentResponseFormatSchema } from '@/workflow/schemas/agent-response-format-schema';

import { type RunAgentMessage } from './runAgentType';

const runAgentMessageSchema: z.ZodType<RunAgentMessage> = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  attachments: z
    .array(z.object({ fileId: z.string(), filename: z.string().optional() }))
    .optional(),
});

// nullish like the GraphQL input it parses, whose optional fields can be sent as null
export const generateInputSchema = z.object({
  input: z
    .array(runAgentMessageSchema)
    .min(1)
    .max(100)
    .refine(
      (messages) =>
        messages.every(
          ({ content, attachments }) =>
            isNonEmptyString(content.trim()) || isNonEmptyArray(attachments),
        ),
      { message: 'Each message needs content or attachments' },
    ),
  instructions: z.string().min(1).nullish(),
  // the workspace default model when unset
  modelId: z.string().min(1).nullish(),
  responseFormat: agentResponseFormatSchema.nullish(),
  // no data tools when unset
  scope: aiRunScopeSchema.nullish(),
});
