import { z } from 'zod';

import { isValidAgentResponseSchemaPropertyKey } from '@/ai/utils/is-valid-agent-response-schema-property-key.util';

const agentResponseSchemaSchema = z.object({
  type: z.literal('object'),
  properties: z
    .record(
      z.string(),
      z.object({
        type: z.enum(['string', 'number', 'boolean']),
        description: z.string().optional(),
      }),
    )
    .refine(
      (properties) =>
        Object.keys(properties).every(isValidAgentResponseSchemaPropertyKey),
      {
        message:
          'Output field names can only contain letters, numbers, underscores, dots or hyphens (max 64 characters)',
      },
    ),
  required: z.array(z.string()).optional(),
  additionalProperties: z.literal(false).optional(),
});

export const agentResponseFormatSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text') }),
  z.object({ type: z.literal('json'), schema: agentResponseSchemaSchema }),
]);
