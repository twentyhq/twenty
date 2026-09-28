import { type AiEvaluationQuestionType } from '@/ai/constants/ai-evaluation-question-type.const';

// A `choice` option or one `score` level. Score levels are ordered lowest
// first, and their position is the score the model returns.
export type WorkflowClassifyCriterion = {
  // Positional meaning, stable identity: deleting a row shifts every later
  // criterion, and an editor keyed on position would leave the shifted rows
  // showing the values they held before.
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
