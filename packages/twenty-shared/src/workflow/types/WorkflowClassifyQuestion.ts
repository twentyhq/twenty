import { type AiEvaluationQuestionType } from '@/ai/constants/ai-evaluation-question-type.const';

// Score levels are ordered lowest first; their position is the score the model returns.
export type WorkflowClassifyCriterion = {
  // Deleting a row shifts later positions, so editors must key rows on id, not position.
  id: string;
  name: string;
  description?: string;
};

export type WorkflowClassifyQuestion = {
  // Stable across renames so the editor can reorder rows without remounting.
  id: string;
  // Also the answer key, so downstream steps read {{stepId.answers.<name>}}.
  name: string;
  type: AiEvaluationQuestionType;
  instructions: string;
  // Empty for `boolean`, which needs no criteria.
  criteria: WorkflowClassifyCriterion[];
};
