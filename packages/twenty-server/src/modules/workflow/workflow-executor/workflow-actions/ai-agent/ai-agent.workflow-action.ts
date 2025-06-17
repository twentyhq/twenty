import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkflowExecutor } from 'src/modules/workflow/workflow-executor/interfaces/workflow-executor.interface';

import { AgentExecutionService } from 'src/engine/metadata-modules/agent/agent-execution.service';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/agent/agent.exception';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutorInput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { WorkflowExecutorOutput } from 'src/modules/workflow/workflow-executor/types/workflow-executor-output.type';

import { isWorkflowAiAgentAction } from './guards/is-workflow-ai-agent-action.guard';

@Injectable()
export class AiAgentWorkflowAction implements WorkflowExecutor {
  constructor(
    private readonly agentExecutionService: AgentExecutionService,
    @InjectRepository(AgentEntity, 'core')
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowExecutorInput): Promise<WorkflowExecutorOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new WorkflowStepExecutorException(
        'Step not found',
        WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
      );
    }

    if (!isWorkflowAiAgentAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an AI Agent action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { agentId } = step.settings.input;

    try {
      const agent = await this.agentRepository.findOne({
        where: {
          id: agentId,
          workspaceId: context.workspaceId as string,
        },
      });

      if (!agent) {
        throw new AgentException(
          `Agent with id ${agentId} not found`,
          AgentExceptionCode.AGENT_NOT_FOUND,
        );
      }

      const response = await this.agentExecutionService.executeAgent(
        agent,
        context,
      );

      return { result: response };
    } catch (error) {
      if (error instanceof AgentException) {
        return {
          error: `${error.message} (${error.code})`,
        };
      }

      return {
        error:
          error instanceof Error ? error.message : 'AI Agent execution failed',
      };
    }
  }
}
