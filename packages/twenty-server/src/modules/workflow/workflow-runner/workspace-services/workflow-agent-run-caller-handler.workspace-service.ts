import { Injectable, type OnModuleInit } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-input.type';
import { type AgentRunCallerHandler } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-handler.type';
import { type AgentRunCallerWaitingState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-waiting-state.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { WorkflowAgentConversationWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/services/workflow-agent-conversation.workspace-service';
import { buildWorkflowAgentRunExecutionContext } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-workflow-agent-run-execution-context.util';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { getWorkflowStepWaitingState } from 'src/modules/workflow/workflow-runner/utils/get-workflow-step-waiting-state.util';
import { WorkflowRunStepLogWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-step-log.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

type WorkflowStepCaller = Extract<AgentRunCaller, { type: 'WORKFLOW_STEP' }>;

// A step waiting on a CALLBACK takes the outcome of the agent run the engine continued
@Injectable()
export class WorkflowAgentRunCallerHandlerWorkspaceService
  implements AgentRunCallerHandler<WorkflowStepCaller>, OnModuleInit
{
  constructor(
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowRunStepLogService: WorkflowRunStepLogWorkspaceService,
    private readonly workflowExecutionContextService: WorkflowExecutionContextService,
    private readonly workflowAgentConversationService: WorkflowAgentConversationWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  onModuleInit(): void {
    this.callerHandlerRegistry.register('WORKFLOW_STEP', this);
  }

  async buildExecutionContext({
    workspaceId,
    caller,
  }: AgentRunCallerInput<WorkflowStepCaller>): Promise<AgentRunExecutionContext> {
    const runInfo = { workflowRunId: caller.ref.workflowRunId, workspaceId };

    return buildWorkflowAgentRunExecutionContext({
      executionContext:
        await this.workflowExecutionContextService.getExecutionContext(runInfo),
      turnCreatedBy:
        await this.workflowAgentConversationService.findTurnCreatedBy(runInfo),
    });
  }

  async getWaitingState({
    workspaceId,
    caller,
  }: AgentRunCallerInput<WorkflowStepCaller>): Promise<AgentRunCallerWaitingState> {
    return getWorkflowStepWaitingState({
      workflowRun: await this.workflowRunWorkspaceService.getWorkflowRun({
        workflowRunId: caller.ref.workflowRunId,
        workspaceId,
      }),
      stepId: caller.ref.stepId,
    });
  }

  // The run job ends the step with the outcome through the executor's usual path, so a failure is
  // retried or continues on failure like any failed step
  async onOutcome({
    workspaceId,
    caller: {
      ref: { workflowRunId, stepId },
    },
    threadId,
    outcome,
    summary,
  }: Parameters<
    NonNullable<AgentRunCallerHandler<WorkflowStepCaller>['onOutcome']>
  >[0]): Promise<void> {
    if (isDefined(summary)) {
      await this.workflowRunStepLogService.setAiAgentStepLog({
        workflowRunId,
        workspaceId,
        stepId,
        summary,
        threadId,
      });
    }

    const actionOutput =
      outcome.status === 'FAILED'
        ? { error: outcome.error }
        : { result: outcome.result };

    // the step stays pending until the job claims it, so the run must not stay running without one
    try {
      await this.messageQueueService.add<RunWorkflowJobData>(
        RUN_WORKFLOW_JOB_NAME,
        {
          workspaceId,
          workflowRunId,
          awaitedStepOutput: { stepId, actionOutput },
        },
        buildRunWorkflowJobOptions(workflowRunId),
      );
    } catch (error) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: 'The run could not resume after its step was handed its outcome',
      });

      throw error;
    }
  }
}
