import { isDefined } from 'twenty-shared/utils';
import {
  getWorkflowAiAgentStepKind,
  isWorkflowAiAgentGenerateStep,
  type WorkflowAiAgentStepKind,
} from 'twenty-shared/workflow';

import { type AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// a deleted agent leaves the step without one rather than failing, so the step can still be edited or removed
export const findWorkflowAiAgentStepAgent = async ({
  agentService,
  input,
  workspaceId,
}: {
  agentService: Pick<AgentService, 'findOneAgentById'>;
  input: Pick<WorkflowAiAgentAction['settings']['input'], 'agentId'>;
  workspaceId: string;
}): Promise<{
  stepKind: WorkflowAiAgentStepKind;
  agent: FlatAgentWithRoleId | null;
}> => {
  const { agentId } = input;

  if (isWorkflowAiAgentGenerateStep(input) || !isDefined(agentId)) {
    return { stepKind: 'generate', agent: null };
  }

  const agent = await agentService
    .findOneAgentById({ id: agentId, workspaceId })
    .catch((error) => {
      if (
        error instanceof AiException &&
        error.code === AiExceptionCode.AGENT_NOT_FOUND
      ) {
        return null;
      }

      throw error;
    });

  return { stepKind: getWorkflowAiAgentStepKind(input, agent), agent };
};
