import { z } from 'zod';

import { AI_EVALUATION_QUESTION_TYPES } from '@/ai/constants/ai-evaluation-question-type.const';

import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowClassifyCriterionSchema = z.object({
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
    .describe(
      'Answer key for this question. Downstream steps read {{stepId.answers.<name>}}.',
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
