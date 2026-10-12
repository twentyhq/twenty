import { type AskQuestionToolInput } from 'twenty-shared/ai';

import {
  askQuestionInputSchema,
  buildAskQuestionPendingOutput,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-question.pausing-tool';

const SEVERAL_QUESTIONS_GUIDANCE =
  'To ask several questions, call it once per question in the same step: the user goes ' +
  'through them one by one and the conversation continues once all are answered.';

const STANDARD_DESCRIPTION =
  'Ask the user a multiple-choice question when you need a decision you cannot infer ' +
  'from the request or context and that has no obvious default. The conversation pauses ' +
  'until the user answers, then continues with their choice in mind. Prefer this over ' +
  'guessing on consequential or ambiguous decisions. Do NOT use it for information you ' +
  'could look up with another tool, or for trivial choices with an obvious default. The ' +
  `user can always type a free-form answer instead of picking an option. ${SEVERAL_QUESTIONS_GUIDANCE}`;

const WORKSPACE_SETUP_DESCRIPTION =
  'Ask the user a multiple-choice question when a decision is theirs to make. The ' +
  'conversation pauses until the user answers, then continues with their choice in mind. ' +
  'Do NOT use it for information you could look up with another tool. The user can always ' +
  `type a free-form answer instead of picking an option. ${SEVERAL_QUESTIONS_GUIDANCE}`;

export const createAskQuestionTool = ({
  isWorkspaceSetupThread,
}: {
  isWorkspaceSetupThread: boolean;
}) => ({
  description: isWorkspaceSetupThread
    ? WORKSPACE_SETUP_DESCRIPTION
    : STANDARD_DESCRIPTION,
  inputSchema: askQuestionInputSchema,
  execute: async (input: AskQuestionToolInput) =>
    buildAskQuestionPendingOutput(input),
});
