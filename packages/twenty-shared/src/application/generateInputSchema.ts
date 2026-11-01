import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';

import { aiRunScopeSchema } from '@/ai/schemas/internal/ai-run-scope-schema';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';
import { agentResponseFormatSchema } from '@/workflow/schemas/agent-response-format-schema';

import { type RunAgentMessage } from './runAgentType';

// nullish like the GraphQL input it parses, whose optional fields can be sent as null
const toUndefinedWhenNull = <TValue>(value: TValue | null | undefined) =>
  value ?? undefined;

const runAgentMessageSchema: z.ZodType<RunAgentMessage> = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  attachments: z
    .array(
      z.object({
        fileId: z.string(),
        filename: z.string().nullish().transform(toUndefinedWhenNull),
      }),
    )
    .nullish()
    .transform(toUndefinedWhenNull),
});

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
  // a new id the caller picks for the run, so it can follow the run before it starts; the run streams only then
  runId: z.uuid().nullish(),
});
