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

// Returns the `ask_questions` tool part still awaiting an answer (status
// 'pending'), if any. Used to set the thread's pending-question marker after a
// turn halts, and to locate the part to resolve when the user answers.
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
