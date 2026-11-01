import { type z } from 'zod';

import { type workflowAiAgentActionSettingsSchema } from '@/workflow/schemas/ai-agent-action-settings-schema';
import { type WorkflowAiAgentStepConfigIssueCode } from '@/workflow/constants/WorkflowAiAgentStepConfigIssueMessages';
import { type WorkflowAiAgentStepKind } from '@/workflow/types/WorkflowAiAgentStepKind';
import { hasWorkflowAiAgentConversationConfig } from '@/workflow/utils/hasWorkflowAiAgentConversationConfig';
import { hasWorkflowAiAgentInlineConfig } from '@/workflow/utils/hasWorkflowAiAgentInlineConfig';

export const getWorkflowAiAgentStepConfigIssues = ({
  stepKind,
  input,
}: {
  stepKind: WorkflowAiAgentStepKind;
  input: Partial<z.infer<typeof workflowAiAgentActionSettingsSchema>['input']>;
}): WorkflowAiAgentStepConfigIssueCode[] => {
  if (stepKind === 'generate') {
    return hasWorkflowAiAgentConversationConfig(input)
      ? ['GENERATE_STEP_HAS_CONVERSATION_CONFIG']
      : [];
  }

  return hasWorkflowAiAgentInlineConfig(input)
    ? ['AGENT_STEP_HAS_INLINE_CONFIG']
    : [];
};
