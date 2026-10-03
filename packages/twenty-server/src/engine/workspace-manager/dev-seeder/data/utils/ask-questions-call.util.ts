import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionItem,
} from 'twenty-shared/ai';

import { createAskQuestionsTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';
import { type SeededToolCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-tool-call.type';

export const askQuestionsCall = (
  questions: AskQuestionItem[],
): SeededToolCall => ({
  toolName: ASK_QUESTIONS_TOOL_NAME,
  input: { questions },
  buildPendingOutput: () =>
    createAskQuestionsTool({ isWorkspaceSetupThread: false }).execute({
      questions,
    }),
});
