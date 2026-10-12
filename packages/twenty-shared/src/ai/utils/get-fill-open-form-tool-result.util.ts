import { type ToolUIPart } from 'ai';
import { z } from 'zod';

import { FILL_OPEN_FORM_TOOL_NAME } from '@/ai/constants/fill-open-form-tool-name.const';
import { type ExtendedUIMessagePart } from '@/ai/types/ExtendedUIMessagePart';

const fillOpenFormToolOutputSchema = z.object({
  success: z.literal(true),
  result: z.object({
    formId: z.string(),
    values: z.record(z.string(), z.string()),
  }),
});

const isFillOpenFormToolPart = (
  part: ExtendedUIMessagePart,
): part is ToolUIPart => part.type === `tool-${FILL_OPEN_FORM_TOOL_NAME}`;

export const getFillOpenFormToolResult = (
  part: ExtendedUIMessagePart,
): {
  toolCallId: string;
  formId: string;
  values: Record<string, string>;
} | null => {
  if (!isFillOpenFormToolPart(part) || part.state !== 'output-available') {
    return null;
  }

  const parsedOutput = fillOpenFormToolOutputSchema.safeParse(part.output);

  return parsedOutput.success
    ? { toolCallId: part.toolCallId, ...parsedOutput.data.result }
    : null;
};
