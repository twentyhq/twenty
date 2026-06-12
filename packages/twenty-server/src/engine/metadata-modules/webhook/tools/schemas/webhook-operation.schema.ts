import { z } from 'zod';

const recordOperationSchema = z.object({
  kind: z
    .literal('record')
    .describe("Record event ('<objectNameSingular>.<event>')"),
  object: z
    .string()
    .min(1)
    .describe(
      "Object name singular (e.g. 'person', 'company', 'task'), or '*' for all objects.",
    ),
  event: z
    .enum(['created', 'updated', 'deleted', '*'])
    .describe("Event kind. Use '*' to match every event for the given object."),
});

const metadataOperationSchema = z.object({
  kind: z
    .literal('metadata')
    .describe(
      "Metadata event ('metadata.<metadataName>.<operation>') — fires on changes to objects, fields, views, workflows, etc.",
    ),
  metadataName: z
    .string()
    .min(1)
    .describe(
      "Metadata name (e.g. 'object', 'field', 'view', 'workflow'), or '*' for all.",
    ),
  operation: z
    .enum(['created', 'updated', 'deleted', '*'])
    .describe("Operation kind. Use '*' to match every operation."),
});

export const webhookOperationSchema = z
  .array(
    z.discriminatedUnion('kind', [
      recordOperationSchema,
      metadataOperationSchema,
    ]),
  )
  .min(1)
  .describe(
    "Events that trigger the webhook. Record events compile to '<object>.<event>' (e.g. 'person.created'). Metadata events compile to 'metadata.<metadataName>.<operation>' (e.g. 'metadata.workflow.updated'). Use [{kind:'record',object:'*',event:'*'}] to subscribe to all record events.",
  );
