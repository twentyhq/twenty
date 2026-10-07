import { z } from 'zod';

import { agentRunSummarySchema } from '@/ai/schemas/agent-run-summary-schema';

const stepLogEntrySchema = z.object({
  timestamp: z.string(),
  level: z.enum(['debug', 'info', 'warn', 'error']),
  message: z.string(),
});

const aiAgentStepLogDetailsSchema = agentRunSummarySchema.extend({
  type: z.literal('AI_AGENT'),
  // the conversation the agent ran in
  threadId: z.string().optional(),
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
  fromHandle: z.string().optional(),
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

const stepLogDetailsSchema = z.discriminatedUnion('type', [
  aiAgentStepLogDetailsSchema,
  codeStepLogDetailsSchema,
  httpRequestStepLogDetailsSchema,
  emailStepLogDetailsSchema,
  createCalendarEventStepLogDetailsSchema,
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
