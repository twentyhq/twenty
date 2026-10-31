import { isNonEmptyString } from '@sniptt/guards';
import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { WORKFLOW_BASE_SYSTEM_PROMPT } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-base-system-prompt.constant';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { APPLICATION_BOUND_AGENT_EXCLUDED_TOOL_NAMES } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/application-bound-agent-excluded-tool-names.constant';
import { WORKFLOW_AGENT_HUMAN_INPUT_PROMPT } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/constants/workflow-agent-human-input-prompt.constant';

// what the engine needs to run the step, and to continue it after a pause
export const buildWorkflowAgentRunSpec = ({
  step,
  isApplicationBound,
  applicationId,
}: {
  step: WorkflowAiAgentAction;
  isApplicationBound: boolean;
  // the application the workflow belongs to, which a step without an agent runs under
  applicationId: string | null;
}): AgentRunSpec => {
  const {
    agentId,
    instructions,
    modelId,
    modelConfiguration,
    scope,
    humanInputInstructions,
    responseFormat,
  } = step.settings.input;
  const trimmedHumanInputInstructions = humanInputInstructions?.trim();
  const canAskHumans = isNonEmptyString(trimmedHumanInputInstructions);

  return {
    ...(isNonEmptyString(agentId)
      ? { agentId }
      : {
          agentId: null,
          inlineConfig: {
            instructions: instructions ?? '',
            modelId: modelId ?? AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
            modelConfiguration: modelConfiguration ?? null,
            scope: scope ?? null,
            applicationId,
            promptCacheKey: `workflow-step:${step.id}`,
          },
        }),
    title: step.name,
    baseSystemPrompt: WORKFLOW_BASE_SYSTEM_PROMPT,
    instructions: canAskHumans
      ? `${WORKFLOW_AGENT_HUMAN_INPUT_PROMPT}\n\n${trimmedHumanInputInstructions}`
      : null,
    capabilities: {
      canAskHumans,
    },
    ...(isDefined(responseFormat) ? { responseFormat } : {}),
    ...(isApplicationBound
      ? {
          additionalExcludedToolNames: [
            ...APPLICATION_BOUND_AGENT_EXCLUDED_TOOL_NAMES,
          ],
        }
      : {}),
  };
};
