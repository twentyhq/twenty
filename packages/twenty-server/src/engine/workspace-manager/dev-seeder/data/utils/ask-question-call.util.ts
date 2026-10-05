import { ASK_QUESTION_TOOL_NAME, type AskQuestionItem } from 'twenty-shared/ai';

import { type SeededToolCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-tool-call.type';

export const askQuestionCall = (question: AskQuestionItem): SeededToolCall => ({
  toolName: ASK_QUESTION_TOOL_NAME,
  input: question,
});
