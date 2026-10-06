import { Injectable, Logger } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfo } from 'twenty-shared/workflow';
import { In, IsNull, Not } from 'typeorm';
import { v4 } from 'uuid';

import { WithLock } from 'src/engine/core-modules/cache-lock/with-lock.decorator';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { readToolCallWorkflowStep } from 'src/engine/metadata-modules/ai/ai-chat/utils/read-tool-call-workflow-step.util';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { closeOpenToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/close-open-tool-parts.util';
import {
  WorkflowRunStatus,
  type WorkflowRunState,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { setAllIteratorsStepInfosAsStopped } from 'src/modules/workflow/common/utils/set-all-iterators-step-infos-as-stopped.util';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { getStepRetryAttempt } from 'src/modules/workflow/workflow-executor/utils/get-step-retry-attempt.util';
import { isWorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/guards/is-workflow-ai-agent-action.guard';
import { isWorkflowSendChatMessageAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-chat-message/guards/is-workflow-send-chat-message-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';

@Injectable()
export class WorkflowRunWorkspaceService {
  private readonly logger = new Logger(WorkflowRunWorkspaceService.name);

  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
    private readonly metricsService: MetricsService,
    private readonly workflowRunRecordShareService: WorkflowRunRecordShareService,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    private readonly workflowStepWaitWorkspaceService: WorkflowStepWaitWorkspaceService,
  ) {}

  async createCoreWorkflowRun({
    coreWorkflowId,
    coreWorkflowVersionId,
    workspaceWorkflowId,
    workspaceWorkflowVersionId,
    workflowName,
    trigger,
    steps,
    createdBy,
    workflowRunId,
    status,
    triggerPayload,
    error,
    workspaceId,
  }: {
    coreWorkflowId: string;
    coreWorkflowVersionId: string;
    workspaceWorkflowId: string | null;
    workspaceWorkflowVersionId: string | null;
    workflowName: string | null;
    trigger: WorkflowTrigger;
    steps: WorkflowAction[];
    createdBy: ActorMetadata;
    status:
      | WorkflowRunStatus.NOT_STARTED
      | WorkflowRunStatus.ENQUEUED
      | WorkflowRunStatus.FAILED;
    triggerPayload: object;
    workflowRunId?: string;
    error?: string;
    workspaceId: string;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRunRepository =
        this.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
          'workflowRun',
          { shouldBypassPermissionChecks: true },
        );
      const position = await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: { isCustom: false, nameSingular: 'workflowRun' },
        workspaceId,
      });
      const lastWorkflowRun = await workflowRunRepository.findOne({
        where: { coreWorkflowId },
        order: { createdAt: 'DESC' },
      });
      const workflowRunCountMatch = lastWorkflowRun?.name?.match(/#(\d+)/);
      const workflowRunCount = workflowRunCountMatch
        ? parseInt(workflowRunCountMatch[1], 10)
        : 0;
      const id = workflowRunId ?? v4();

      await workflowRunRepository.insert({
        id,
        name: `#${workflowRunCount + 1} - ${workflowName ?? 'Workflow'}`,
        workflowVersionId: workspaceWorkflowVersionId,
        workflowId: workspaceWorkflowId,
        coreWorkflowId,
        coreWorkflowVersionId,
        createdBy,
        status,
        position,
        state: this.getInitState({ trigger, steps }, triggerPayload, error),
        enqueuedAt: status === WorkflowRunStatus.ENQUEUED ? new Date() : null,
      });

      // A run is a private system-written record, so nobody reads it until it carries its workflow's grants
      await this.workflowRunRecordShareService.syncRuns({
        workspaceId,
        workflowRunIds: [id],
      });

      return id;
    }, authContext);
  }

  @WithLock('workflowRunId')
  async startWorkflowRun({
    workflowRunId,
    workspaceId,
  }: {
    workflowRunId: string;
    workspaceId: string;
  }) {
    const workflowRunToUpdate = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    if (
      workflowRunToUpdate.status !== WorkflowRunStatus.ENQUEUED &&
      workflowRunToUpdate.status !== WorkflowRunStatus.NOT_STARTED
    ) {
      throw new WorkflowRunException(
        'Workflow run is not enqueued or not started',
        WorkflowRunExceptionCode.INVALID_OPERATION,
      );
    }

    const partialUpdate = {
      status: WorkflowRunStatus.RUNNING,
      startedAt: new Date().toISOString(),
      state: {
        ...workflowRunToUpdate.state,
        stepInfos: {
          ...workflowRunToUpdate.state?.stepInfos,
          trigger: {
            result: {},
            ...workflowRunToUpdate.state?.stepInfos.trigger,
            status: StepStatus.SUCCESS,
          },
        },
      },
    };

    await this.updateWorkflowRun({ workflowRunId, workspaceId, partialUpdate });
  }

  @WithLock('workflowRunId')
  async endWorkflowRun({
    workflowRunId,
    workspaceId,
    status,
    error,
    isSystemError,
  }: {
    workflowRunId: string;
    workspaceId: string;
    status: Extract<WorkflowRunStatus, 'COMPLETED' | 'FAILED' | 'STOPPED'>;
    error?: string;
    isSystemError?: boolean;
  }) {
    const workflowRunToUpdate = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    let updatedStepInfos = {};

    updatedStepInfos = this.markRunningStepsAsFailed({
      stepInfosToUpdate: workflowRunToUpdate.state?.stepInfos ?? {},
    });

    const partialUpdate = {
      status,
      endedAt: new Date().toISOString(),
      state: {
        ...workflowRunToUpdate.state,
        workflowRunError: error,
        stepInfos: updatedStepInfos,
      },
    };

    await this.updateWorkflowRun({ workflowRunId, workspaceId, partialUpdate });

    // the run is already over and its waits find nothing to resume, so a failure must not stop the cleanup below
    await this.workflowStepWaitWorkspaceService
      .cancelRunWaits({ workspaceId, workflowRunId })
      .catch((error: unknown) => {
        this.logger.error(
          `Failed to cancel the waits of workflow run ${workflowRunId} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      });

    const stepThreadIds = Object.values(
      workflowRunToUpdate.state?.stepInfos ?? {},
    )
      .map((stepInfo) => stepInfo?.threadId)
      .filter(isDefined);

    // An ended run cannot consume answers, so close the calls its conversations wait on.
    // Best effort: a failure only leaves a call that looks waiting.
    if (stepThreadIds.length > 0) {
      await this.closeWaitingConversations({
        workflowRunId,
        workspaceId,
        stepThreadIds,
      }).catch((error: unknown) => {
        this.logger.error(
          `Failed to close the conversations of workflow run ${workflowRunId} in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      });
    }

    const metricKey =
      status === WorkflowRunStatus.COMPLETED
        ? MetricsKeys.WorkflowRunCompleted
        : status === WorkflowRunStatus.STOPPED
          ? MetricsKeys.WorkflowRunStopped
          : MetricsKeys.WorkflowRunFailed;

    await this.metricsService.incrementCounterForEvent({
      key: metricKey,
      eventId: workflowRunId,
    });

    if (isSystemError) {
      await this.metricsService.incrementCounterForEvent({
        key: MetricsKeys.WorkflowRunSystemError,
        eventId: workflowRunId,
        debugLog: `[Workflow Run System Error] Workflow run ${workflowRunId} in workspace ${workspaceId} ended with system error`,
      });
    }
  }

  @WithLock('workflowRunId')
  async updateWorkflowRunStepInfo({
    stepId,
    stepInfo,
    workflowRunId,
    workspaceId,
  }: {
    stepId: string;
    stepInfo: WorkflowRunStepInfo;
    workflowRunId: string;
    workspaceId: string;
  }) {
    const workflowRunToUpdate = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    const partialUpdate = {
      state: {
        ...workflowRunToUpdate.state,
        stepInfos: {
          ...workflowRunToUpdate.state?.stepInfos,
          [stepId]: {
            ...workflowRunToUpdate.state?.stepInfos[stepId],
            result: stepInfo?.result,
            error: stepInfo?.error,
            status: stepInfo.status,
            wait: stepInfo?.wait,
          },
        },
      },
    };

    await this.updateWorkflowRun({ workflowRunId, workspaceId, partialUpdate });
  }

  // Built from persisted step info: only it carries the failed attempt's conversation
  @WithLock('workflowRunId')
  async moveStepToRetry({
    stepId,
    resumedThreadId,
    error,
    workflowRunId,
    workspaceId,
  }: {
    stepId: string;
    resumedThreadId?: string;
    error: string;
    workflowRunId: string;
    workspaceId: string;
  }) {
    const workflowRunToUpdate = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    const currentStepInfo = workflowRunToUpdate.state?.stepInfos?.[stepId];

    await this.updateWorkflowRun({
      workflowRunId,
      workspaceId,
      partialUpdate: {
        state: {
          ...workflowRunToUpdate.state,
          stepInfos: {
            ...workflowRunToUpdate.state?.stepInfos,
            [stepId]: {
              ...currentStepInfo,
              status: StepStatus.PENDING,
              error,
              threadId: resumedThreadId,
              history: [
                ...(currentStepInfo?.history ?? []),
                {
                  status: StepStatus.FAILED,
                  error,
                  retryAttempt:
                    getStepRetryAttempt({ stepInfo: currentStepInfo }) + 1,
                  threadId: currentStepInfo?.threadId,
                },
              ],
            },
          },
        },
      },
    });
  }

  @WithLock('workflowRunId')
  async updateWorkflowRunStepInfos({
    stepInfos,
    workflowRunId,
    workspaceId,
  }: {
    stepInfos: Record<string, WorkflowRunStepInfo>;
    workflowRunId: string;
    workspaceId: string;
  }) {
    const workflowRunToUpdate = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    const existingStepInfos = workflowRunToUpdate.state?.stepInfos ?? {};

    const mergedStepInfos = { ...existingStepInfos };

    for (const [stepId, info] of Object.entries(stepInfos)) {
      mergedStepInfos[stepId] = {
        ...existingStepInfos[stepId],
        ...info,
      };
    }

    const partialUpdate = {
      state: {
        ...workflowRunToUpdate.state,
        stepInfos: mergedStepInfos,
      },
    };

    await this.updateWorkflowRun({
      workflowRunId,
      workspaceId,
      partialUpdate,
    });
  }

  // Written from the locked state, or a concurrent step-info write (e.g. a form submission) would be reverted
  @WithLock('workflowRunId')
  async markWorkflowRunAsStopping({
    workflowRunId,
    workspaceId,
  }: {
    workflowRunId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const workflowRunToUpdate = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    if (
      workflowRunToUpdate.status !== WorkflowRunStatus.RUNNING ||
      !isDefined(workflowRunToUpdate.state)
    ) {
      return false;
    }

    const { stepInfos, flow } = workflowRunToUpdate.state;

    await this.updateWorkflowRun({
      workflowRunId,
      workspaceId,
      partialUpdate: {
        status: WorkflowRunStatus.STOPPING,
        state: {
          ...workflowRunToUpdate.state,
          stepInfos: {
            ...stepInfos,
            ...setAllIteratorsStepInfosAsStopped({
              stepInfos,
              steps: flow.steps,
            }),
          },
        },
      },
    });

    return true;
  }

  // Shares the step-info write lock so of two concurrent callers the second finds the step no longer PENDING.
  // A stop is refused: endWorkflowRun fails a pending step, or leaves it PENDING with nothing to resume.
  // expectedThreadId must still be the step's: a retry or another loop iteration replaces it.
  @WithLock('workflowRunId')
  async updateStepInfoIfPending({
    stepId,
    stepInfo,
    expectedThreadId,
    workflowRunId,
    workspaceId,
  }: {
    stepId: string;
    stepInfo: Partial<WorkflowRunStepInfo>;
    expectedThreadId?: string;
    workflowRunId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const workflowRunToUpdate = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    const currentStepInfo = workflowRunToUpdate.state?.stepInfos?.[stepId];

    if (
      workflowRunToUpdate.status !== WorkflowRunStatus.RUNNING ||
      currentStepInfo?.status !== StepStatus.PENDING ||
      isDefined(currentStepInfo.error) ||
      (isDefined(expectedThreadId) &&
        currentStepInfo.threadId !== expectedThreadId)
    ) {
      return false;
    }

    await this.updateWorkflowRun({
      workflowRunId,
      workspaceId,
      partialUpdate: {
        state: {
          ...workflowRunToUpdate.state,
          stepInfos: {
            ...workflowRunToUpdate.state?.stepInfos,
            // the step leaves PENDING, so it no longer waits
            [stepId]: { ...currentStepInfo, wait: undefined, ...stepInfo },
          },
        },
      },
    });

    return true;
  }

  // A conversation replaced by a retry or a later loop iteration belongs to no step
  // several Send Message steps of one run post to the same inbox thread, so the step a call names wins
  async findStepAwaitingAnswer({
    threadId,
    workflowRunId,
    workspaceId,
    expectedStepId,
  }: {
    threadId: string;
    workflowRunId: string;
    workspaceId: string;
    expectedStepId?: string;
  }): Promise<WorkflowAction | null> {
    const workflowRun = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    const [stepId, stepInfo] =
      Object.entries(workflowRun.state?.stepInfos ?? {}).find(
        ([candidateStepId, stepInfo]) =>
          stepInfo?.threadId === threadId &&
          (isDefined(expectedStepId)
            ? candidateStepId === expectedStepId
            : stepInfo?.status === StepStatus.PENDING),
      ) ?? [];

    if (
      workflowRun.status !== WorkflowRunStatus.RUNNING ||
      !isDefined(stepId) ||
      isDefined(stepInfo?.error) ||
      stepInfo?.status !== StepStatus.PENDING
    ) {
      return null;
    }

    const step = workflowRun.state?.flow?.steps?.find(
      (candidateStep) => candidateStep.id === stepId,
    );

    // a form step is submitted from its run, even one that older versions gave a conversation
    return isDefined(step) &&
      (isWorkflowAiAgentAction(step) || isWorkflowSendChatMessageAction(step))
      ? step
      : null;
  }

  // a step posting a call still runs until its executor marks it pending, and an answer may arrive first;
  // a step is named by its id when it posted to an inbox, or by its conversation on its own run
  async isStepStillRunning({
    stepId,
    threadId,
    workflowRunId,
    workspaceId,
  }: {
    stepId?: string;
    threadId: string;
    workflowRunId: string;
    workspaceId: string;
  }): Promise<boolean> {
    const workflowRun = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    const stepInfos = workflowRun.state?.stepInfos ?? {};
    const stepInfo = isDefined(stepId)
      ? stepInfos[stepId]
      : Object.values(stepInfos).find(
          (candidateStepInfo) => candidateStepInfo?.threadId === threadId,
        );

    return (
      workflowRun.status === WorkflowRunStatus.RUNNING &&
      stepInfo?.status === StepStatus.RUNNING
    );
  }

  @WithLock('workflowRunId')
  async setStepThreadId({
    stepId,
    threadId,
    workflowRunId,
    workspaceId,
  }: {
    stepId: string;
    threadId: string;
    workflowRunId: string;
    workspaceId: string;
  }) {
    const workflowRunToUpdate = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    const currentStepInfo = workflowRunToUpdate.state?.stepInfos?.[stepId];

    if (!isDefined(currentStepInfo)) {
      return;
    }

    await this.updateWorkflowRun({
      workflowRunId,
      workspaceId,
      partialUpdate: {
        state: {
          ...workflowRunToUpdate.state,
          stepInfos: {
            ...workflowRunToUpdate.state?.stepInfos,
            [stepId]: { ...currentStepInfo, threadId },
          },
        },
      },
    });
  }

  @WithLock('workflowRunId')
  async updateWorkflowRunStep({
    workflowRunId,
    step,
    workspaceId,
  }: {
    workflowRunId: string;
    step: WorkflowAction;
    workspaceId: string;
  }) {
    const workflowRunToUpdate = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    if (
      workflowRunToUpdate.status === WorkflowRunStatus.COMPLETED ||
      workflowRunToUpdate.status === WorkflowRunStatus.FAILED
    ) {
      throw new WorkflowRunException(
        'Cannot update steps of a completed or failed workflow run',
        WorkflowRunExceptionCode.INVALID_OPERATION,
      );
    }

    const updatedSteps = workflowRunToUpdate.state?.flow?.steps?.map(
      (existingStep) => (step.id === existingStep.id ? step : existingStep),
    );

    const partialUpdate = {
      state: {
        ...workflowRunToUpdate.state,
        flow: {
          ...workflowRunToUpdate.state?.flow,
          steps: updatedSteps,
        },
      },
    };

    await this.updateWorkflowRun({ workflowRunId, workspaceId, partialUpdate });
  }

  async getWorkflowRun({
    workflowRunId,
    workspaceId,
  }: {
    workflowRunId: string;
    workspaceId: string;
  }): Promise<WorkflowRunWorkspaceEntity | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRunRepository =
        this.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
          'workflowRun',
          { shouldBypassPermissionChecks: true },
        );

      return await workflowRunRepository.findOne({
        where: { id: workflowRunId },
      });
    }, authContext);
  }

  // read with the requester's own permissions, which follow the visibility of the run's workflow
  async isWorkflowRunReadableByRequester(
    workflowRunId: string,
  ): Promise<boolean> {
    try {
      const workflowRun =
        await this.workspaceOrmManager.executeInWorkspaceContext(() =>
          this.workspaceOrmManager
            .getRepositoryWithContextPermissions<WorkflowRunWorkspaceEntity>(
              'workflowRun',
            )
            .findOne({ where: { id: workflowRunId }, select: { id: true } }),
        );

      return isDefined(workflowRun);
    } catch (error) {
      if (error instanceof PermissionsException) {
        return false;
      }

      throw error;
    }
  }

  async getWorkflowRunOrFail({
    workflowRunId,
    workspaceId,
  }: {
    workflowRunId: string;
    workspaceId: string;
  }): Promise<WorkflowRunWorkspaceEntity> {
    const workflowRun = await this.getWorkflowRun({
      workflowRunId,
      workspaceId,
    });

    if (!workflowRun) {
      throw new WorkflowRunException(
        'Workflow run not found',
        WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

    return workflowRun;
  }

  async updateWorkflowRun({
    workflowRunId,
    workspaceId,
    partialUpdate,
  }: {
    workflowRunId: string;
    workspaceId: string;
    partialUpdate: Partial<WorkflowRunWorkspaceEntity>;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRunRepository =
        this.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
          'workflowRun',
          { shouldBypassPermissionChecks: true },
        );

      const workflowRunToUpdate = await workflowRunRepository.findOneBy({
        id: workflowRunId,
      });

      if (!workflowRunToUpdate) {
        throw new WorkflowRunException(
          `workflowRun ${workflowRunId} not found`,
          WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
        );
      }

      await workflowRunRepository.update(workflowRunToUpdate.id, partialUpdate);
    }, authContext);
  }

  private async closeWaitingConversations({
    workflowRunId,
    workspaceId,
    stepThreadIds,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepThreadIds: string[];
  }): Promise<void> {
    // An answer holding a conversation's claim closes its calls itself once it finds the run over
    const stepThreads = await this.threadRepository.find(workspaceId, {
      where: {
        id: In(stepThreadIds),
        pendingQuestionMessageId: Not(IsNull()),
        activeStreamId: IsNull(),
      },
      select: ['id', 'pendingQuestionMessageId'],
    });

    const waitingThreads = await this.filterThreadsWaitingOnRun({
      threads: stepThreads,
      workflowRunId,
      workspaceId,
    });

    for (const { id, pendingQuestionMessageId } of waitingThreads) {
      if (!isDefined(pendingQuestionMessageId)) {
        continue;
      }

      const { affected } = await this.threadRepository.update(
        workspaceId,
        { id, pendingQuestionMessageId, activeStreamId: IsNull() },
        { pendingQuestionMessageId: null },
      );

      if (affected === 0) {
        continue;
      }

      await closeOpenToolParts({
        messagePartRepository: this.messagePartRepository,
        messageId: pendingQuestionMessageId,
        workspaceId,
      });
    }
  }

  // the member may have moved on to another question in their conversation, which the run must not close
  private async filterThreadsWaitingOnRun<
    TThread extends { pendingQuestionMessageId: string | null },
  >({
    threads,
    workflowRunId,
    workspaceId,
  }: {
    threads: TThread[];
    workflowRunId: string;
    workspaceId: string;
  }): Promise<TThread[]> {
    const pendingMessageIds = threads
      .map((thread) => thread.pendingQuestionMessageId)
      .filter(isDefined);

    if (pendingMessageIds.length === 0) {
      return [];
    }

    const pendingParts = await this.messagePartRepository.find(workspaceId, {
      where: { messageId: In(pendingMessageIds) },
      select: ['messageId', 'toolOutput'],
    });

    const messageIdsWaitingOnRun = new Set(
      pendingParts
        .filter(
          (part) =>
            readToolCallWorkflowStep(part.toolOutput)?.workflowRunId ===
            workflowRunId,
        )
        .map((part) => part.messageId),
    );

    return threads.filter(
      (thread) =>
        isDefined(thread.pendingQuestionMessageId) &&
        messageIdsWaitingOnRun.has(thread.pendingQuestionMessageId),
    );
  }

  private getInitState(
    workflowVersion: Pick<WorkflowVersionWorkspaceEntity, 'trigger' | 'steps'>,
    triggerPayload: object,
    error?: string,
  ): WorkflowRunState | undefined {
    if (
      !isDefined(workflowVersion.trigger) ||
      !isDefined(workflowVersion.steps)
    ) {
      return undefined;
    }

    return {
      flow: {
        trigger: workflowVersion.trigger,
        steps: workflowVersion.steps,
      },
      stepInfos: {
        trigger: { status: StepStatus.NOT_STARTED, result: triggerPayload },
        ...Object.fromEntries(
          workflowVersion.steps.map((step) => [
            step.id,
            { status: StepStatus.NOT_STARTED },
          ]),
        ),
      },
      workflowRunError: error,
    };
  }

  private markRunningStepsAsFailed({
    stepInfosToUpdate,
  }: {
    stepInfosToUpdate: Record<string, WorkflowRunStepInfo>;
  }) {
    return Object.entries(stepInfosToUpdate ?? {})
      .map(([stepId, step]) => {
        if (
          step.status === StepStatus.RUNNING ||
          step.status === StepStatus.PENDING
        ) {
          return {
            [stepId]: {
              ...step,
              status: StepStatus.FAILED,
              error: 'Workflow has been ended before this step was completed',
            },
          };
        }

        return {
          [stepId]: step,
        };
      })
      .reduce((acc, current) => {
        return {
          ...acc,
          ...current,
        };
      }, {});
  }
}
