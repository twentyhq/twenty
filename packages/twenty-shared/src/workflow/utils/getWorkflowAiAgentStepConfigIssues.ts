import { type z } from 'zod';

import { type workflowAiAgentActionSettingsSchema } from '@/workflow/schemas/ai-agent-action-settings-schema';
import { type WorkflowAiAgentStepConfigIssueCode } from '@/workflow/constants/WorkflowAiAgentStepConfigIssueMessages';
import { hasAiRunScopeRepeatedEntries } from '@/ai/utils/has-ai-run-scope-repeated-entries.util';
import { hasWorkflowAiAgentConversationConfig } from '@/workflow/utils/hasWorkflowAiAgentConversationConfig';
import { hasWorkflowAiAgentInlineConfig } from '@/workflow/utils/hasWorkflowAiAgentInlineConfig';
import { isWorkflowAiAgentGenerateStep } from '@/workflow/utils/isWorkflowAiAgentGenerateStep';

export const getWorkflowAiAgentStepConfigIssues = (
  input: Partial<z.infer<typeof workflowAiAgentActionSettingsSchema>['input']>,
): WorkflowAiAgentStepConfigIssueCode[] => {
  if (isWorkflowAiAgentGenerateStep(input)) {
    return [
      ...(hasWorkflowAiAgentConversationConfig(input)
        ? (['GENERATE_STEP_HAS_CONVERSATION_CONFIG'] as const)
        : []),
      ...(hasAiRunScopeRepeatedEntries(input.scope)
        ? (['GENERATE_STEP_SCOPE_HAS_REPEATED_ENTRIES'] as const)
        : []),
    ];
  }

  return hasWorkflowAiAgentInlineConfig(input)
    ? ['AGENT_STEP_HAS_INLINE_CONFIG']
    : [];
};
