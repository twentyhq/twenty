import { z } from 'zod';

import {
  ASK_QUESTIONS_TOOL_NAME,
  type AskQuestionsToolInput,
  type AskQuestionsToolResult,
} from 'twenty-shared/ai';

export { ASK_QUESTIONS_TOOL_NAME };

export const askQuestionsInputSchema = z.object({
  questions: z
    .array(
      z.object({
        header: z
          .string()
          .describe(
            'Very short label/tag for the question (≤ ~32 chars), e.g. "Email type".',
          ),
        question: z
          .string()
          .describe(
            'The full question to ask the user. Be clear and specific.',
          ),
        options: z
          .array(
            z.object({
              label: z
                .string()
                .describe('Concise option the user can pick (1-5 words).'),
              description: z
                .string()
                .optional()
                .describe(
                  'Longer explanation shown when the user opens the option info icon.',
                ),
              isRecommended: z
                .boolean()
                .optional()
                .describe('Mark the single suggested option, if any.'),
            }),
          )
          .min(2)
          .max(4)
          .refine(
            (options) =>
              options.filter((option) => option.isRecommended === true)
                .length <= 1,
            { message: 'At most one option can be marked as recommended.' },
          )
          .describe('2-4 mutually exclusive options.'),
        allowMultiSelect: z
          .boolean()
          .optional()
          .describe('Allow the user to select more than one option.'),
      }),
    )
    .min(1)
    .max(4)
    .describe('One to four questions to ask the user.'),
});

type AskQuestionsPendingOutput = {
  success: true;
  message: string;
  result: AskQuestionsToolResult;
};

export const createAskQuestionsTool = () => ({
  description:
    'Ask the user one or more multiple-choice questions when you need a decision you cannot ' +
    'infer from the request or context and that has no obvious default. The conversation ' +
    'pauses until the user answers, then continues with their choice in mind. Prefer this ' +
    'over guessing on consequential or ambiguous decisions. Do NOT use it for information you ' +
    'could look up with another tool, or for trivial choices with an obvious default. The ' +
    'user can always type a free-form answer instead of picking an option.',
  inputSchema: askQuestionsInputSchema,
  execute: async (
    input: AskQuestionsToolInput,
  ): Promise<AskQuestionsPendingOutput> => ({
    success: true,
    message: 'Questions presented to the user; awaiting their answer.',
    result: { questions: input.questions, status: 'pending' },
  }),
});
