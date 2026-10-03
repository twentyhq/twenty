import { type AskQuestionsToolInput } from 'twenty-shared/ai';

import {
  askQuestionsInputSchema,
  buildAskQuestionsPendingOutput,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-questions.pausing-tool';

const STANDARD_DESCRIPTION =
  'Ask the user one or more multiple-choice questions when you need a decision you cannot ' +
  'infer from the request or context and that has no obvious default. The conversation ' +
  'pauses until the user answers, then continues with their choice in mind. Prefer this ' +
  'over guessing on consequential or ambiguous decisions. Do NOT use it for information you ' +
  'could look up with another tool, or for trivial choices with an obvious default. The ' +
  'user can always type a free-form answer instead of picking an option.';

const WORKSPACE_SETUP_DESCRIPTION =
  'Ask the user one or more multiple-choice questions when a decision is theirs to make. ' +
  'The conversation pauses until the user answers, then continues with their choice in ' +
  'mind. Do NOT use it for information you could look up with another tool. The user can ' +
  'always type a free-form answer instead of picking an option.';

export const createAskQuestionsTool = ({
  isWorkspaceSetupThread,
}: {
  isWorkspaceSetupThread: boolean;
}) => ({
  description: isWorkspaceSetupThread
    ? WORKSPACE_SETUP_DESCRIPTION
    : STANDARD_DESCRIPTION,
  inputSchema: askQuestionsInputSchema,
  execute: async (input: AskQuestionsToolInput) =>
    buildAskQuestionsPendingOutput(input),
});
