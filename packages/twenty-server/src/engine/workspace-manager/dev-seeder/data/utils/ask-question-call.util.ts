import { ASK_QUESTION_TOOL_NAME, type AskQuestionItem } from 'twenty-shared/ai';

import { buildAskQuestionPendingOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-question.pausing-tool';
import { type SeededToolCall } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-tool-call.type';

export const askQuestionCall = (question: AskQuestionItem): SeededToolCall => ({
  toolName: ASK_QUESTION_TOOL_NAME,
  input: question,
  buildPendingOutput: async () => buildAskQuestionPendingOutput(question),
});
