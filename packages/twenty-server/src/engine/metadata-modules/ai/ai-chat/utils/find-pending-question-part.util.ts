import { getToolName, isToolUIPart } from 'ai';
import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionsToolResult,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';

type ToolPartWithOutput = ExtendedUIMessagePart & {
  toolCallId: string;
  output?: { result?: AskQuestionsToolResult };
};

export const findPendingQuestionPart = (
  parts: ExtendedUIMessagePart[],
): ToolPartWithOutput | undefined => {
  for (const part of parts) {
    if (!isToolUIPart(part) || getToolName(part) !== ASK_QUESTIONS_TOOL_NAME) {
      continue;
    }

    const output = (part as ToolPartWithOutput).output;

    if (output?.result?.status === 'pending') {
      return part as ToolPartWithOutput;
    }
  }

  return undefined;
};
