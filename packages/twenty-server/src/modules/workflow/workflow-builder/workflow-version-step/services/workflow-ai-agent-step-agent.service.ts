import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  isAgentRunnableAsWorkflowStep,
  isWorkflowAiAgentGenerateStep,
} from 'twenty-shared/workflow';

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
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class WorkflowAiAgentStepAgentService {
  constructor(private readonly agentService: AgentService) {}

  // a deleted agent leaves the step without one rather than failing, so the step can still be edited or removed
  async findStepAgent({
    input,
    workspaceId,
  }: {
    input: Pick<WorkflowAiAgentAction['settings']['input'], 'agentId'>;
    workspaceId: string;
  }): Promise<FlatAgentWithRoleId | null> {
    const { agentId } = input;

    if (isWorkflowAiAgentGenerateStep(input) || !isDefined(agentId)) {
      return null;
    }

    return this.agentService
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
  }

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
