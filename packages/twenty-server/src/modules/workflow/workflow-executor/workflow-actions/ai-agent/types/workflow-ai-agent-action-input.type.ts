export type WorkflowAiAgentActionInput = {
  modelProvider: 'openai' | 'anthropic';
  model: string;
  prompt: string;
  responseFormat: string;
};
