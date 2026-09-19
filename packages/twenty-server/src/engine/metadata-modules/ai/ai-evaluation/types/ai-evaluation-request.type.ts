import {
  type AiEvaluationModelInput,
  type AiEvaluationModelQuestion,
} from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model.type';

export type AiEvaluationRequest = {
  workspaceId: string;
  // Undefined runs the workspace's default evaluation model, and the default
  // language model when no evaluation model is configured.
  modelId?: string;
  state: AiEvaluationModelInput;
  questions: Record<string, AiEvaluationModelQuestion>;
  abortSignal?: AbortSignal;
};
