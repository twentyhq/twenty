import { type z } from 'zod';

import {
  type mcpServerToolInputSchemaSchema,
  type mcpServerToolSchema,
} from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.schema';

export type McpServerTool = z.infer<typeof mcpServerToolSchema>;

export type McpServerToolInputSchema = z.infer<
  typeof mcpServerToolInputSchemaSchema
>;

export type McpServerToolAnnotations = NonNullable<
  McpServerTool['annotations']
>;
