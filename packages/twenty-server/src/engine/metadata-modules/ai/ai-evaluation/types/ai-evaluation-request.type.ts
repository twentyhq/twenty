import {
  type AiEvaluationModelInput,
  type AiEvaluationModelQuestion,
} from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model.type';

export type AiEvaluationRequest = {
  workspaceId: string;
  // spend attribution and quota check target
  userWorkspaceId?: string | null;
  state: AiEvaluationModelInput;
  questions: Record<string, AiEvaluationModelQuestion>;
  abortSignal?: AbortSignal;
};
