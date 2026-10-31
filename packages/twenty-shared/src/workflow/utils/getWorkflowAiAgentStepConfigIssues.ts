import { type z } from 'zod';

import { type workflowAiAgentConversationConfigSchema } from '@/workflow/schemas/ai-agent-conversation-config-schema';
import { type workflowAiAgentInlineConfigSchema } from '@/workflow/schemas/ai-agent-inline-config-schema';
import { type WorkflowAiAgentStepConfigIssueCode } from '@/workflow/constants/WorkflowAiAgentStepConfigIssueMessages';
import { hasWorkflowAiAgentConversationConfig } from '@/workflow/utils/hasWorkflowAiAgentConversationConfig';
import { hasWorkflowAiAgentInlineConfig } from '@/workflow/utils/hasWorkflowAiAgentInlineConfig';

// hasAgent rather than agentId, since a manifest step names its agent by universal identifier
export const getWorkflowAiAgentStepConfigIssues = ({
  hasAgent,
  input,
}: {
  hasAgent: boolean;
  input: z.infer<typeof workflowAiAgentInlineConfigSchema> &
    z.infer<typeof workflowAiAgentConversationConfigSchema>;
}): WorkflowAiAgentStepConfigIssueCode[] => {
  if (hasAgent) {
    return hasWorkflowAiAgentInlineConfig(input)
      ? ['AGENT_STEP_HAS_INLINE_CONFIG']
      : [];
  }

  return hasWorkflowAiAgentConversationConfig(input)
    ? ['GENERATE_STEP_HAS_CONVERSATION_CONFIG']
    : [];
};
