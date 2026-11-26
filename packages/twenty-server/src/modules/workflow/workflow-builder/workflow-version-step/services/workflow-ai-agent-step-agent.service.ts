import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isAgentRunnableAsWorkflowStep } from 'twenty-shared/workflow';

import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';

@Injectable()
export class WorkflowAiAgentStepAgentService {
  constructor(private readonly agentService: AgentService) {}

  async findAgentRunnableByNewStepOrThrow({
    agentId,
    workspaceId,
  }: {
    agentId: string;
    workspaceId: string;
  }): Promise<FlatAgentWithRoleId> {
    const agent = await this.agentService
      .findOneAgentById({ id: agentId, workspaceId })
      .catch((error) => {
        if (
          error instanceof AiException &&
          error.code === AiExceptionCode.AGENT_NOT_FOUND
        ) {
          throw new WorkflowVersionStepException(
            `Agent "${agentId}" not found. Run an existing agent, or give the step its own instructions.`,
            WorkflowVersionStepExceptionCode.NOT_FOUND,
            {
              userFriendlyMessage: msg`The agent this step should run was not found.`,
            },
          );
        }

        throw error;
      });

    if (!isAgentRunnableAsWorkflowStep(agent)) {
      const { label } = agent;

      throw new WorkflowVersionStepException(
        `Agent "${label}" is archived or belongs to another workflow step, so a new step cannot run it. Run an active agent, or give the step its own instructions.`,
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        {
          userFriendlyMessage: msg`Agent "${label}" is archived or belongs to another workflow step, so a new step cannot run it.`,
        },
      );
    }

    return agent;
  }
}
