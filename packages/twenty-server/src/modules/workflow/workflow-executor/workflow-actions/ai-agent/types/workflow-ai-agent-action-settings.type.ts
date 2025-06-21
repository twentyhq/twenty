import { WorkflowAiAgentActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/types/workflow-ai-agent-action-input.type';
import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export type WorkflowAiAgentActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowAiAgentActionInput;
};
