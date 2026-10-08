import { isNonEmptyString } from '@sniptt/guards';

import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { WORKFLOW_BASE_SYSTEM_PROMPT } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-base-system-prompt.constant';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { APPLICATION_BOUND_AGENT_EXCLUDED_TOOL_NAMES } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/application-bound-agent-excluded-tool-names.constant';
import { WORKFLOW_AGENT_HUMAN_INPUT_PROMPT } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-agent-human-input-prompt.constant';

// what the engine needs to run the step's agent, and to continue it after a pause
export const buildWorkflowAgentRunSpec = ({
  step,
  isApplicationBound,
}: {
  step: WorkflowAiAgentAction;
  isApplicationBound: boolean;
}): AgentRunSpec => {
  const { agentId, humanInputInstructions } = step.settings.input;
  const trimmedHumanInputInstructions = humanInputInstructions?.trim();
  const canAskHumans = isNonEmptyString(trimmedHumanInputInstructions);

  return {
    agentId: isNonEmptyString(agentId) ? agentId : null,
    title: step.name,
    baseSystemPrompt: WORKFLOW_BASE_SYSTEM_PROMPT,
    instructions: canAskHumans
      ? `${WORKFLOW_AGENT_HUMAN_INPUT_PROMPT}\n\n${trimmedHumanInputInstructions}`
      : null,
    capabilities: {
      canAskHumans,
    },
    ...(isApplicationBound
      ? {
          additionalExcludedToolNames: [
            ...APPLICATION_BOUND_AGENT_EXCLUDED_TOOL_NAMES,
          ],
        }
      : {}),
  };
};
