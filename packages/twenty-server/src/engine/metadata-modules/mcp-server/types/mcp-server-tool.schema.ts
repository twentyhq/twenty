import { isNonEmptyString, isObject } from '@sniptt/guards';
import { z } from 'zod';

// Model providers reject other tool names, and remote text ends up in the system prompt.
const TOOL_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;
const PROMPT_TEXT_MAX_LENGTH = 1024;
const CONTROL_CHARACTERS_PATTERN =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const promptTextSchema = z
  .string()
  .transform((text) =>
    text
      .replace(CONTROL_CHARACTERS_PATTERN, '')
      .trim()
      .slice(0, PROMPT_TEXT_MAX_LENGTH),
  );

const mcpServerToolAnnotationsSchema = z.object({
  title: promptTextSchema.optional(),
  readOnlyHint: z.boolean().optional(),
  destructiveHint: z.boolean().optional(),
  idempotentHint: z.boolean().optional(),
  openWorldHint: z.boolean().optional(),
});

// Nested schema nodes stay opaque objects: TypeORM cannot type a recursive JSON value on a jsonb column.
const jsonSchemaNodeSchema = z.custom<object>(isObject);

export const mcpServerToolInputSchemaSchema = z
  .object({
    type: z.literal('object'),
    properties: z.record(z.string(), jsonSchemaNodeSchema).optional(),
    required: z.array(z.string()).optional(),
  })
  .catchall(
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.null(),
      jsonSchemaNodeSchema,
    ]),
  );

export const mcpServerToolSchema = z.object({
  name: z.string().regex(TOOL_NAME_PATTERN),
  description: promptTextSchema
    .optional()
    .transform((description) =>
      isNonEmptyString(description) ? description : null,
    ),
  inputSchema: mcpServerToolInputSchemaSchema,
  annotations: mcpServerToolAnnotationsSchema
    .optional()
    .transform((annotations) => annotations ?? null),
});
