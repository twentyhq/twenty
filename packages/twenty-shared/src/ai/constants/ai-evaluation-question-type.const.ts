// The three decisions an evaluation model can be asked for. Mirrors the AI SDK
// evaluation specification, restated here so the domain never depends on an
// experimental provider type.
export const AI_EVALUATION_QUESTION_TYPES = [
  'choice',
  'score',
  'boolean',
] as const;

export type AiEvaluationQuestionType =
  (typeof AI_EVALUATION_QUESTION_TYPES)[number];
