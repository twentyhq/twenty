import { type z } from 'zod';

import { isDefined } from '@/utils/validation/isDefined';
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

  const issues: WorkflowAiAgentStepConfigIssueCode[] = [];

  if (hasWorkflowAiAgentInlineConfig(input)) {
    issues.push('AGENT_STEP_HAS_INLINE_CONFIG');
  }

  // only a step-owned agent kept its response format on the step; a reusable agent owns its own
  if (stepKind === 'agent' && isDefined(input.responseFormat)) {
    issues.push('AGENT_STEP_HAS_RESPONSE_FORMAT');
  }

  return issues;
};
