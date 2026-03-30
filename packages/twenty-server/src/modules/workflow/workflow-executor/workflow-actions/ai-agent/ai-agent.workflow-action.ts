import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { resolveInput } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AUTO_SELECT_SMART_MODEL_ID } from 'twenty-shared/constants';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';

import { isWorkflowAiAgentAction } from './guards/is-workflow-ai-agent-action.guard';

@Injectable()
export class AiAgentWorkflowAction implements WorkflowAction {
  constructor(
    private readonly aiAgentExecutionService: AgentAsyncExecutorService,
    private readonly aiBillingService: AiBillingService,
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
      throw new WorkflowStepExecutorException(
        `Agent with id ${agentId} not found`,
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const executionContext =
      await this.workflowExecutionContextService.getExecutionContext(runInfo);

    const userWorkspaceId =
      executionContext.authContext.type === 'user'
        ? executionContext.authContext.userWorkspaceId
        : null;

    const { result, usage, cacheCreationTokens } =
      await this.aiAgentExecutionService.executeAgent({
        agent,
        userPrompt: resolveInput(prompt, context) as string,
        actorContext: executionContext.isActingOnBehalfOfUser
          ? executionContext.initiator
          : undefined,
        rolePermissionConfig: executionContext.rolePermissionConfig,
        authContext: executionContext.authContext,
      });

    await this.aiBillingService.calculateAndBillUsage(
      agent?.modelId ?? AUTO_SELECT_SMART_MODEL_ID,
      { usage, cacheCreationTokens },
      workspaceId,
      UsageOperationType.AI_WORKFLOW_TOKEN,
      agent?.id || null,
      userWorkspaceId,
    );

    return {
      result,
    };
  }
}
