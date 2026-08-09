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

const createCalendarEventStepLogDetailsSchema = z.object({
  type: z.literal('CREATE_CALENDAR_EVENT'),
  status: z.enum(['SUCCESS', 'ERROR']),
  title: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  attendeeCount: z.number().optional(),
  conferenceLink: z.string().optional(),
  connectedAccountId: z.string().optional(),
  iCalUid: z.string().optional(),
  error: z.string().optional(),
  durationMs: z.number(),
});

const createInboxItemStepLogDetailsSchema = z.object({
  type: z.literal('CREATE_INBOX_ITEM'),
  status: z.enum(['SUCCESS', 'ERROR']),
  title: z.string().optional(),
  inboxItemId: z.string().optional(),
  queueId: z.string().optional(),
  assigneeUserWorkspaceId: z.string().optional(),
  error: z.string().optional(),
  durationMs: z.number(),
});

const stepLogDetailsSchema = z.discriminatedUnion('type', [
  aiAgentStepLogDetailsSchema,
  codeStepLogDetailsSchema,
  httpRequestStepLogDetailsSchema,
  emailStepLogDetailsSchema,
  createCalendarEventStepLogDetailsSchema,
  createInboxItemStepLogDetailsSchema,
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

export const workflowRunStepLogsSchema = z.record(z.string(), z.unknown());
