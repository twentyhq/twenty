import {
  type AiEvaluationModelInput,
  type AiEvaluationModelQuestion,
} from 'src/engine/metadata-modules/ai/ai-models/types/ai-evaluation-model.type';

export type AiEvaluationRequest = {
  workspaceId: string;
  // Attributes the spend to the member who triggered the run, and is the
  // spender the quota check is made against.
  userWorkspaceId?: string | null;
  // Undefined runs the workspace's default evaluation model, and the default
  // language model when no evaluation model is configured.
  modelId?: string;
  state: AiEvaluationModelInput;
  questions: Record<string, AiEvaluationModelQuestion>;
  abortSignal?: AbortSignal;
};
