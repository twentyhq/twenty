import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { resolveInput } from 'twenty-shared/utils';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { AIBillingService } from 'src/engine/core-modules/ai/services/ai-billing.service';
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
import { WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';

import { isWorkflowAiAgentAction } from './guards/is-workflow-ai-agent-action.guard';

@Injectable()
export class AiAgentWorkflowAction implements WorkflowAction {
  constructor(
    private readonly agentExecutionService: AgentExecutionService,
    private readonly aiBillingService: AIBillingService,
    @InjectRepository(AgentEntity, 'core')
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
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

    const { agentId, prompt } = step.settings.input;
    const workspaceId = context.workspaceId as string;

    try {
      let agent: AgentEntity | null = null;

      if (agentId) {
        agent = await this.agentRepository.findOne({
          where: {
            id: agentId,
            workspaceId,
          },
        });
      }

      if (agentId && !agent) {
        throw new AgentException(
          `Agent with id ${agentId} not found`,
          AgentExceptionCode.AGENT_NOT_FOUND,
        );
      }

      const { result, usage } = await this.agentExecutionService.executeAgent({
        agent,
        context,
        schema: step.settings.outputSchema,
        userPrompt: resolveInput(prompt, context) as string,
      });

      await this.aiBillingService.calculateAndBillUsage(
        agent?.modelId ?? 'auto',
        usage,
        workspaceId,
      );

      return {
        result,
      };
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
