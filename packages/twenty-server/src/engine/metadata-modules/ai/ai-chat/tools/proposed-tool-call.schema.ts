import {
  PROPOSED_TOOL_CALL_TEMPLATES,
  type ProposedToolCall,
} from 'twenty-shared/ai';
import { z } from 'zod';

export const proposedToolCallSchema: z.ZodType<ProposedToolCall> = z.object({
  toolName: z.string(),
  toolLabel: z.string(),
  summary: z.string(),
  arguments: z.record(z.string(), z.unknown()),
  template: z.enum(PROPOSED_TOOL_CALL_TEMPLATES),
  alternativeToolNames: z.array(z.string()).optional(),
  objectNameSingular: z.string().optional(),
  recordId: z.string().optional(),
  currentValues: z.record(z.string(), z.unknown()).optional(),
});
