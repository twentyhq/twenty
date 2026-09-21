import { type WorkflowClassifyQuestion } from 'twenty-shared/workflow';

export type WorkflowClassifyActionInput = {
  // Undefined runs the workspace's default classification model.
  modelId?: string;
  allowLanguageModelFallback?: boolean;
  state: string;
  questions: WorkflowClassifyQuestion[];
};
