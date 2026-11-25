import { type z } from 'zod';

import { type workflowAiAgentActionSettingsSchema } from '@/workflow/schemas/ai-agent-action-settings-schema';
import { type WorkflowAiAgentStepConfigIssueCode } from '@/workflow/constants/WorkflowAiAgentStepConfigIssueMessages';
import { hasAiRunScopeRepeatedEntries } from '@/ai/utils/has-ai-run-scope-repeated-entries.util';
import { workflowAiAgentConversationConfigSchema } from '@/workflow/schemas/ai-agent-conversation-config-schema';
import { workflowAiAgentInlineConfigSchema } from '@/workflow/schemas/ai-agent-inline-config-schema';
import { hasWorkflowAiAgentConfig } from '@/workflow/utils/hasWorkflowAiAgentConfig';
import { isWorkflowAiAgentGenerateStep } from '@/workflow/utils/isWorkflowAiAgentGenerateStep';

export const getWorkflowAiAgentStepConfigIssues = (
  input: Partial<z.infer<typeof workflowAiAgentActionSettingsSchema>['input']>,
): WorkflowAiAgentStepConfigIssueCode[] => {
  if (isWorkflowAiAgentGenerateStep(input)) {
    return [
      ...(hasWorkflowAiAgentConfig(
        workflowAiAgentConversationConfigSchema,
        input,
      )
        ? (['GENERATE_STEP_HAS_CONVERSATION_CONFIG'] as const)
        : []),
      ...(hasAiRunScopeRepeatedEntries(input.scope)
        ? (['GENERATE_STEP_SCOPE_HAS_REPEATED_ENTRIES'] as const)
        : []),
    ];
  }

  return hasWorkflowAiAgentConfig(workflowAiAgentInlineConfigSchema, input)
    ? ['AGENT_STEP_HAS_INLINE_CONFIG']
    : [];
};
