import { z } from 'zod';

const stepLogEntrySchema = z.object({
  timestamp: z.string(),
  level: z.enum(['debug', 'info', 'warn', 'error']),
  message: z.string(),
});

const aiToolCallLogSchema = z.object({
  toolName: z.string(),
  toolCallId: z.string(),
  providerExecuted: z.boolean().optional(),
  input: z.unknown().optional(),
  output: z.unknown().optional(),
  errorMessage: z.string().optional(),
  state: z.enum(['started', 'success', 'error', 'awaiting-approval']),
});

const aiAgentStepLogDetailsSchema = z.object({
  type: z.literal('AI_AGENT'),
  modelId: z.string(),
  usage: z.object({
    inputTokens: z.number(),
    outputTokens: z.number(),
    reasoningTokens: z.number().optional(),
    cacheReadTokens: z.number().optional(),
    cacheCreationTokens: z.number().optional(),
    totalTokens: z.number(),
  }),
  cost: z.object({
    totalCostInDollars: z.number(),
    creditsUsedMicro: z.number(),
  }),
  nativeWebSearchCallCount: z.number(),
  toolCalls: z.array(aiToolCallLogSchema),
  durationMs: z.number(),
});

const codeStepLogDetailsSchema = z.object({
  type: z.literal('CODE'),
  durationMs: z.number(),
  status: z.enum(['SUCCESS', 'ERROR']),
  error: z
    .object({
      type: z.string(),
      message: z.string(),
      stackTrace: z.string().optional(),
    })
    .nullable()
    .optional(),
});

const httpRequestStepLogDetailsSchema = z.object({
  type: z.literal('HTTP_REQUEST'),
  request: z.object({
    method: z.string(),
    url: z.string(),
    headers: z.record(z.string(), z.string()),
    body: z.string().optional(),
    bodyBytes: z.number().optional(),
    bodyTruncated: z.boolean().optional(),
  }),
  // `response` is absent for transport-level failures (DNS, timeout, TLS,
  // etc.) — only `error` is set in that case.
  response: z
    .object({
      status: z.number(),
      statusText: z.string().optional(),
      headers: z.record(z.string(), z.string()),
      body: z.string().optional(),
      bodyBytes: z.number().optional(),
      bodyTruncated: z.boolean().optional(),
    })
    .optional(),
  error: z.string().optional(),
  durationMs: z.number(),
});

const emailStepLogDetailsSchema = z.object({
  type: z.literal('EMAIL'),
  mode: z.enum(['SEND', 'DRAFT']),
  status: z.enum(['SUCCESS', 'ERROR']),
  recipients: z.object({
    to: z.array(z.string()),
    cc: z.array(z.string()).optional(),
    bcc: z.array(z.string()).optional(),
  }),
  subject: z.string().optional(),
  bodyPreview: z.string().optional(),
  bodyBytes: z.number().optional(),
  bodyTruncated: z.boolean().optional(),
  connectedAccountId: z.string().optional(),
  attachmentCount: z.number().optional(),
  inReplyTo: z.string().optional(),
  error: z.string().optional(),
  durationMs: z.number(),
});

const stepLogDetailsSchema = z.discriminatedUnion('type', [
  aiAgentStepLogDetailsSchema,
  codeStepLogDetailsSchema,
  httpRequestStepLogDetailsSchema,
  emailStepLogDetailsSchema,
]);

export const workflowRunStepLogSchema = z.object({
  details: stepLogDetailsSchema,
  entries: z.array(stepLogEntrySchema),
  truncated: z
    .object({
      droppedEntries: z.number(),
      droppedBytes: z.number(),
    })
    .optional(),
  sizeBytes: z.number(),
});

// We intentionally keep the runtime schema permissive: the column is a
// JSONB blob written by the server and the consumers don't validate
// individual `details` shapes. The strict per-step type (with the
// discriminated `details` union) lives in `WorkflowRunStepLog` and is
// applied at the boundaries that *produce* logs (server-side writers).
// Tighter zod parsing here would collapse the discriminated union to `{}`
// when inferred through `z.record`, breaking front-end indexing.
export const workflowRunStepLogsSchema = z.record(z.string(), z.unknown());
