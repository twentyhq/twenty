import { z } from 'zod';

import { AI_EVALUATION_QUESTION_TYPES } from '@/ai/constants/ai-evaluation-question-type.const';

import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

// An answer name is one segment of a variable path — {{stepId.answers.<name>}}.
// A dot, brace or space in it would be read as structure by the variable
// resolver, so the output the picker advertises would never resolve.
export const CLASSIFY_ANSWER_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

// A choice option's name keys its probability, so it is a path segment too:
// {{stepId.answers.<name>.probabilities.<option>}}. It stays free text because
// the model reads it as the label it is, and a segment with spaces or brackets
// survives the round trip through escapePathSegment. A dot does not: nothing
// escapes it, so the resolver would walk it as two keys.
export const CLASSIFY_OPTION_NAME_FORBIDDEN_CHARACTER = '.';

export const workflowClassifyCriterionSchema = z.object({
  id: z.uuid().describe('Stable identifier for this criterion row.'),
  name: z
    .string()
    .describe(
      'Option name for a choice question, or the label of one score level.',
    ),
  description: z
    .string()
    .optional()
    .describe('What the model should understand this option to mean.'),
});

export const workflowClassifyQuestionSchema = z.object({
  id: z.uuid().describe('Stable identifier for this question row.'),
  name: z
    .string()
    .regex(CLASSIFY_ANSWER_NAME_PATTERN)
    .describe(
      'Answer key for this question, made of letters, digits, underscores and dashes. Downstream steps read {{stepId.answers.<name>}}.',
    ),
  type: z
    .enum(AI_EVALUATION_QUESTION_TYPES)
    .describe(
      'choice picks one option, score grades an ordered rubric, boolean estimates the probability that a statement holds.',
    ),
  instructions: z
    .string()
    .describe('What the model should decide about the shared state.'),
  criteria: z
    .array(workflowClassifyCriterionSchema)
    .describe(
      'Options for a choice question, or ordered levels (lowest first) for a score question. Empty for boolean.',
    ),
});

export const workflowClassifyActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      modelId: z
        .string()
        .optional()
        .describe(
          "Composite model id, or undefined to run on the workspace's default classification model.",
        ),
      state: z
        .string()
        .describe(
          'The shared state every question is asked about. Supports variables.',
        ),
      questions: z.array(workflowClassifyQuestionSchema),
    }),
  });
