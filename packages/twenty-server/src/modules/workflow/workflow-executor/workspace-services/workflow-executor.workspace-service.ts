import { Injectable } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  getWorkflowRunContext,
  StepStatus,
  WorkflowRunStepInfo,
  WorkflowRunStepInfos,
} from 'twenty-shared/workflow';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { USAGE_RECORDED } from 'src/engine/core-modules/usage/constants/usage-recorded.constant';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type UsageEvent } from 'src/engine/core-modules/usage/types/usage-event.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { workflowHasRunningSteps } from 'src/modules/workflow/common/utils/workflow-has-running-steps.util';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowActionFactory } from 'src/modules/workflow/workflow-executor/factories/workflow-action.factory';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import {
  type WorkflowBranchExecutorInput,
  type WorkflowExecutorInput,
} from 'src/modules/workflow/workflow-executor/types/workflow-executor-input';
import { shouldExecuteStep } from 'src/modules/workflow/workflow-executor/utils/should-execute-step.util';
import { shouldFailSafely } from 'src/modules/workflow/workflow-executor/utils/should-fail-safely.util';
import { shouldSkipStepExecution } from 'src/modules/workflow/workflow-executor/utils/should-skip-step-execution.util';
import { workflowShouldFail } from 'src/modules/workflow/workflow-executor/utils/workflow-should-fail.util';
import { workflowShouldKeepRunning } from 'src/modules/workflow/workflow-executor/utils/workflow-should-keep-running.util';
import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import { type WorkflowIfElseResult } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/types/workflow-if-else-result.type';
import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { WorkflowIteratorResult } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-result.type';
import { findEnclosingIteratorWithContinueOnFailure } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/find-enclosing-iterator-with-continue-on-failure.util';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const MAX_EXECUTED_STEPS_COUNT = 20;

@Injectable()
export class WorkflowExecutorWorkspaceService {
  constructor(
    private readonly workflowActionFactory: WorkflowActionFactory,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly billingService: BillingService,
    private readonly billingUsageService: BillingUsageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly metricsService: MetricsService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async executeFromSteps({
    stepIds,
    workflowRunId,
    workspaceId,
    shouldComputeWorkflowRunStatus = true,
    executedStepsCount = 0,
  }: WorkflowExecutorInput) {
    await Promise.all(
      stepIds.map(async (stepIdToExecute) => {
        return this.executeFromStep({
          stepId: stepIdToExecute,
          workflowRunId,
          workspaceId,
          executedStepsCount,
        });
      }),
    );

    if (shouldComputeWorkflowRunStatus) {
      await this.computeWorkflowRunStatus({
        workflowRunId,
        workspaceId,
      });
    }
  }

  private async executeFromStep({
    stepId,
    workflowRunId,
    workspaceId,
    executedStepsCount,
  }: WorkflowBranchExecutorInput): Promise<void> {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    const stepInfos = workflowRun.state.stepInfos;

    const steps = workflowRun.state.flow.steps;

    const stepToExecute = steps.find((step) => step.id === stepId);

    if (!stepToExecute) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: 'Step not found',
        isSystemError: true,
      });

      return;
    }

    let actionOutput: WorkflowActionOutput;

    if (
      shouldExecuteStep({
        step: stepToExecute,
        steps,
        stepInfos,
        workflowRunStatus: workflowRun.status,
      })
    ) {
      actionOutput = await this.executeStep({
        step: stepToExecute,
        steps,
        stepInfos,
        workflowRunId,
        workspaceId,
      });

      if (isDefined(actionOutput.error)) {
        const enclosingIterator = findEnclosingIteratorWithContinueOnFailure({
          failedStepId: stepId,
          steps,
        });

        if (isDefined(enclosingIterator)) {
          actionOutput.shouldFailSafely = true;
        }
      }
    } else if (
      shouldFailSafely({
        step: stepToExecute,
        steps,
        stepInfos,
      })
    ) {
      actionOutput = {
        shouldFailSafely: true,
      };
    } else if (
      shouldSkipStepExecution({
        step: stepToExecute,
        steps,
        stepInfos,
      })
    ) {
      actionOutput = {
        shouldSkipStepExecution: true,
      };
    } else {
      return;
    }

    const isError =
      isDefined(actionOutput.error) && !actionOutput.shouldFailSafely;

    if (
      !isError &&
      !actionOutput.shouldFailSafely &&
      !actionOutput.shouldSkipStepExecution
    ) {
      await this.sendWorkflowNodeRunEvent(workspaceId, workflowRun.workflowId);
    }

    const { shouldProcessNextSteps } = await this.processStepExecutionResult({
      actionOutput,
      stepId,
      workflowRunId,
      workspaceId,
    });

    if (!shouldProcessNextSteps) {
      return;
    }

    const shouldRunAnotherJob =
      executedStepsCount && executedStepsCount > MAX_EXECUTED_STEPS_COUNT;

    if (shouldRunAnotherJob) {
      await this.continueExecutionFromStepInAnotherJob({
        lastExecutedStepId: stepId,
        workflowRunId,
        workspaceId,
      });

      return;
    }

    const { nextStepIdsToExecute, nextStepIdsToSkip, nextStepIdsToFailSafely } =
      await this.getNextStepIdsToExecute({
        executedStep: stepToExecute,
        executedStepOutput: actionOutput,
      });

    if (isDefined(nextStepIdsToSkip) || isDefined(nextStepIdsToFailSafely)) {
      await this.skipAndFailSafelyStepsThenContinue({
        stepIdsToSkip: nextStepIdsToSkip ?? [],
        stepIdsToFailSafely: nextStepIdsToFailSafely ?? [],
        steps,
        workflowRunId,
        workspaceId,
        executedStepsCount: (executedStepsCount ?? 0) + 1,
      });
    }

    if (isDefined(nextStepIdsToExecute) && nextStepIdsToExecute.length > 0) {
      await this.executeFromSteps({
        stepIds: nextStepIdsToExecute,
        workflowRunId,
        workspaceId,
        shouldComputeWorkflowRunStatus: false,
        executedStepsCount: (executedStepsCount ?? 0) + 1,
      });
    }
  }

  async getNextStepIdsToExecute({
    executedStep,
    executedStepOutput,
  }: {
    executedStep: WorkflowAction;
    executedStepOutput: WorkflowActionOutput;
  }): Promise<{
    nextStepIdsToExecute?: string[];
    nextStepIdsToSkip?: string[];
    nextStepIdsToFailSafely?: string[];
  }> {
    const isIteratorStep = isWorkflowIteratorAction(executedStep);

    if (isIteratorStep) {
      const iteratorStepResult = executedStepOutput.result as
        | WorkflowIteratorResult
        | undefined;

      if (
        !iteratorStepResult?.hasProcessedAllItems &&
        !executedStepOutput.shouldFailSafely &&
        !executedStepOutput.shouldSkipStepExecution
      ) {
        const nextStepIdsToExecute = isString(
          executedStep.settings.input.initialLoopStepIds,
        )
          ? JSON.parse(executedStep.settings.input.initialLoopStepIds)
          : executedStep.settings.input.initialLoopStepIds;

        return { nextStepIdsToExecute };
      }
    }

    if (isWorkflowIfElseAction(executedStep)) {
      const ifElseResult = executedStepOutput.result as
        | WorkflowIfElseResult
        | undefined;

      const branches = executedStep.settings.input.branches;

      if (ifElseResult?.matchingBranchId) {
        const matchingBranch = branches.find(
          (branch) => branch.id === ifElseResult.matchingBranchId,
        );

        const nonMatchingBranches = branches.filter(
          (branch) => branch.id !== ifElseResult.matchingBranchId,
        );

        return {
          nextStepIdsToExecute: matchingBranch?.nextStepIds,
          nextStepIdsToSkip: nonMatchingBranches.flatMap(
            (branch) => branch.nextStepIds,
          ),
        };
      } else if (executedStepOutput.shouldFailSafely) {
        return {
          nextStepIdsToFailSafely: branches.flatMap(
            (branch) => branch.nextStepIds,
          ),
        };
      } else {
        return {
          nextStepIdsToSkip: branches.flatMap((branch) => branch.nextStepIds),
        };
      }
    }

    return { nextStepIdsToExecute: executedStep.nextStepIds };
  }

  private async computeWorkflowRunStatus({
    workflowRunId,
    workspaceId,
  }: {
    workflowRunId: string;
    workspaceId: string;
  }) {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    const stepInfos = workflowRun.state.stepInfos;

    const steps = workflowRun.state.flow.steps;

    if (workflowRun.status === WorkflowRunStatus.STOPPING) {
      if (!workflowHasRunningSteps({ stepInfos, steps })) {
        await this.workflowRunWorkspaceService.endWorkflowRun({
          workflowRunId,
          workspaceId,
          status: WorkflowRunStatus.STOPPED,
        });
      }

      return;
    }

    if (workflowShouldFail({ stepInfos, steps })) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error: 'WorkflowRun failed',
      });

      return;
    }

    if (workflowShouldKeepRunning({ stepInfos, steps })) {
      return;
    }

    await this.workflowRunWorkspaceService.endWorkflowRun({
      workflowRunId,
      workspaceId,
      status: WorkflowRunStatus.COMPLETED,
    });
  }

  private async sendWorkflowNodeRunEvent(
    workspaceId: string,
    workflowId: string,
  ) {
    let periodStart: Date | undefined;
    if (this.billingService.isBillingEnabled()) {
      const {
        billingSubscription: { currentPeriodStart },
      } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'billingSubscription',
      ]);

      periodStart = currentPeriodStart;

      await this.billingUsageService.decrementAvailableCredits({
        workspaceId,
        usedCredits: 100,
      });
    }

    this.workspaceEventEmitter.emitCustomBatchEvent<UsageEvent>(
      USAGE_RECORDED,
      [
        {
          resourceType: UsageResourceType.WORKFLOW,
          operationType: UsageOperationType.WORKFLOW_EXECUTION,
          creditsUsedMicro: 100,
          quantity: 1,
          unit: UsageUnit.INVOCATION,
          resourceId: workflowId,
          periodStart,
        },
      ],
      workspaceId,
    );
  }

  private async processStepExecutionResult({
    actionOutput,
    stepId,
    workflowRunId,
    workspaceId,
  }: {
    actionOutput: WorkflowActionOutput;
    stepId: string;
    workflowRunId: string;
    workspaceId: string;
  }): Promise<{ shouldProcessNextSteps: boolean }> {
    const isPendingEvent = actionOutput.pendingEvent;
    const isSuccess = isDefined(actionOutput.result);
    const isStopped = actionOutput.shouldEndWorkflowRun ?? false;
    const isNotFinished = actionOutput.shouldRemainRunning ?? false;
    const isSkipped = actionOutput.shouldSkipStepExecution ?? false;
    const isFailedSafely = actionOutput.shouldFailSafely ?? false;

    let stepInfo: WorkflowRunStepInfo;

    if (isPendingEvent) {
      stepInfo = {
        status: StepStatus.PENDING,
      };
    } else if (isStopped) {
      stepInfo = {
        status: StepStatus.STOPPED,
        result: actionOutput?.result,
      };
    } else if (isNotFinished) {
      stepInfo = {
        status: StepStatus.RUNNING,
        result: actionOutput?.result,
      };
    } else if (isFailedSafely) {
      stepInfo = {
        status: StepStatus.FAILED_SAFELY,
        error: actionOutput?.error,
      };
    } else if (isSuccess) {
      stepInfo = {
        status: StepStatus.SUCCESS,
        result: actionOutput?.result,
      };
    } else if (isSkipped) {
      stepInfo = {
        status: StepStatus.SKIPPED,
      };
    } else {
      stepInfo = {
        status: StepStatus.FAILED,
        error: actionOutput?.error,
      };
    }

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
      stepId,
      stepInfo,
      workflowRunId,
      workspaceId,
    });

    return {
      shouldProcessNextSteps:
        isSuccess || isStopped || isSkipped || isFailedSafely,
    };
  }

  private async executeStep({
    step,
    steps,
    stepInfos,
    workflowRunId,
    workspaceId,
  }: {
    step: WorkflowAction;
    steps: WorkflowAction[];
    stepInfos: WorkflowRunStepInfos;
    workflowRunId: string;
    workspaceId: string;
  }) {
    // Credit-cap enforcement lives at the AI entry points (chat resolver,
    // executeAgent, generate-text controller, title generation). Cheap
    // workflow steps (DB CRUD, branching, actions) are not gated here so a
    // chat-driven cap exhaustion does not block non-AI automations.
    const stepId = step.id;

    const workflowAction = this.workflowActionFactory.get(step.type);

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
      stepId,
      stepInfo: {
        ...stepInfos[stepId],
        status: StepStatus.RUNNING,
      },
      workflowRunId,
      workspaceId,
    });

    try {
      return await workflowAction.execute({
        currentStepId: stepId,
        steps,
        context: getWorkflowRunContext(stepInfos),
        runInfo: {
          workflowRunId,
          workspaceId,
        },
      });
    } catch (error) {
      const isUserError =
        error instanceof WorkflowStepExecutorException &&
        (error.code === WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE ||
          error.code === WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT ||
          error.code === WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND);

      if (!isUserError) {
        this.exceptionHandlerService.captureExceptions([error], {
          workspace: { id: workspaceId },
        });

        await this.metricsService.incrementCounter({
          key: MetricsKeys.WorkflowRunSystemError,
          eventId: workflowRunId,
          debugLog: `[Workflow Run System Error] Workflow run ${workflowRunId} in workspace ${workspaceId} ended with system error`,
        });
      }

      return {
        error: error.message ?? 'Execution result error, no data or error',
      };
    }
  }

  async skipAndFailSafelyStepsThenContinue({
    stepIdsToSkip,
    stepIdsToFailSafely,
    steps,
    workflowRunId,
    workspaceId,
    executedStepsCount,
  }: {
    stepIdsToSkip: string[];
    stepIdsToFailSafely: string[];
    steps: WorkflowAction[];
    workflowRunId: string;
    workspaceId: string;
    executedStepsCount: number;
  }) {
    const stepInfos: Record<string, WorkflowRunStepInfo> = {};

    for (const stepId of stepIdsToSkip) {
      stepInfos[stepId] = { status: StepStatus.SKIPPED };
    }

    for (const stepId of stepIdsToFailSafely) {
      stepInfos[stepId] = { status: StepStatus.FAILED_SAFELY };
    }

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfos({
      stepInfos,
      workflowRunId,
      workspaceId,
    });

    const nextStepIds = new Set<string>();

    for (const stepId of [...stepIdsToSkip, ...stepIdsToFailSafely]) {
      const step = steps.find((step) => step.id === stepId);

      for (const nextStepId of step?.nextStepIds ?? []) {
        nextStepIds.add(nextStepId);
      }
    }

    if (nextStepIds.size > 0) {
      await this.executeFromSteps({
        stepIds: Array.from(nextStepIds),
        workflowRunId,
        workspaceId,
        shouldComputeWorkflowRunStatus: false,
        executedStepsCount,
      });
    }
  }

  private async continueExecutionFromStepInAnotherJob({
    lastExecutedStepId,
    workflowRunId,
    workspaceId,
  }: {
    lastExecutedStepId: string;
    workflowRunId: string;
    workspaceId: string;
  }) {
    await this.messageQueueService.add<RunWorkflowJobData>(
      RUN_WORKFLOW_JOB_NAME,
      {
        workspaceId,
        workflowRunId,
        lastExecutedStepId,
      },
    );
  }
}
