import { isAgentRunnableAsWorkflowStep } from 'twenty-shared/workflow';

import { type AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';

export const findAgentRunnableByNewStepOrThrow = async ({
  agentService,
  agentId,
  workspaceId,
}: {
  agentService: Pick<AgentService, 'findOneAgentById'>;
  agentId: string;
  workspaceId: string;
}): Promise<FlatAgentWithRoleId> => {
  const agent = await agentService
    .findOneAgentById({ id: agentId, workspaceId })
    .catch((error) => {
      if (
        error instanceof AiException &&
        error.code === AiExceptionCode.AGENT_NOT_FOUND
      ) {
        throw new WorkflowVersionStepException(
          `Agent "${agentId}" not found. Run an existing agent, or give the step its own instructions.`,
          WorkflowVersionStepExceptionCode.NOT_FOUND,
        );
      }

      throw error;
    });

  if (!isAgentRunnableAsWorkflowStep(agent)) {
    throw new WorkflowVersionStepException(
      `Agent "${agent.label}" is archived or belongs to another workflow step, so a new step cannot run it. Run an active agent, or give the step its own instructions.`,
      WorkflowVersionStepExceptionCode.INVALID_REQUEST,
    );
  }

  return agent;
};
