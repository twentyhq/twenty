import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { resolveInput } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { AIBillingService } from 'src/engine/metadata-modules/ai-billing/services/ai-billing.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai-agent/entities/agent.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai-agent/agent.exception';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { AiAgentExecutorService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/ai-agent-executor.service';

import { isWorkflowAiAgentAction } from './guards/is-workflow-ai-agent-action.guard';

@Injectable()
export class AiAgentWorkflowAction implements WorkflowAction {
  constructor(
    private readonly aiAgentExecutionService: AiAgentExecutorService,
    private readonly aiBillingService: AIBillingService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({
      stepId: currentStepId,
      steps,
    });

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

      const executionContext =
        await this.workflowExecutionContextService.getExecutionContext(runInfo);

      const { result, usage } = await this.aiAgentExecutionService.executeAgent(
        {
          agent,
          userPrompt: resolveInput(prompt, context) as string,
          actorContext: executionContext.isActingOnBehalfOfUser
            ? executionContext.initiator
            : undefined,
          rolePermissionConfig: executionContext.rolePermissionConfig,
        },
      );

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
