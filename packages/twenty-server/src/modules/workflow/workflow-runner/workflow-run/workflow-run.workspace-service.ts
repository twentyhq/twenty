import { Injectable } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfo } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

import { WithLock } from 'src/engine/core-modules/cache-lock/with-lock.decorator';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { InputAskWorkspaceService } from 'src/modules/input-ask/workspace-services/input-ask.workspace-service';
import {
  WorkflowRunStatus,
  type WorkflowRunState,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { setAllIteratorsStepInfosAsStopped } from 'src/modules/workflow/common/utils/set-all-iterators-step-infos-as-stopped.util';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { getStepRetryAttempt } from 'src/modules/workflow/workflow-executor/utils/get-step-retry-attempt.util';
import { type WorkflowPendingAsk } from 'src/modules/workflow/workflow-executor/types/workflow-pending-ask.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { canWorkflowRunHaveAsks } from 'src/modules/workflow/workflow-runner/utils/can-workflow-run-have-asks.util';
import { findStepIdByThreadId } from 'src/modules/workflow/workflow-runner/utils/find-step-id-by-thread-id.util';
import { getRunInitiatorWorkspaceMemberId } from 'src/modules/workflow/workflow-runner/utils/get-run-initiator-workspace-member-id.util';

export type StepInputResolution =
  | { status: 'RESOLVED'; stepId: string }
  | { status: 'NOT_AWAITING' };

@Injectable()
export class WorkflowRunWorkspaceService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
    private readonly metricsService: MetricsService,
    private readonly inputAskWorkspaceService: InputAskWorkspaceService,
    private readonly workflowRunRecordShareService: WorkflowRunRecordShareService,
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

      // A run is a private record written by the system, so nobody reads it
      // until it carries its workflow's grants.
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

    // A run that ends can no longer consume an answer, so an Ask still
    // waiting on one stops being actionable rather than outliving it.
    if (canWorkflowRunHaveAsks(workflowRunToUpdate.state)) {
      await this.inputAskWorkspaceService.cancel({
        workspaceId,
        match: { workflowRunId },
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

  // A step that parks on a person opens its Ask in the same locked write, so
  // an answer can never find the step waiting without it, and a run ending
  // right after cannot miss it when canceling what is left pending.
  @WithLock('workflowRunId')
  async updateWorkflowRunStepInfo({
    stepId,
    stepInfo,
    pendingAsk,
    workflowRunId,
    workspaceId,
  }: {
    stepId: string;
    stepInfo: WorkflowRunStepInfo;
    pendingAsk?: WorkflowPendingAsk;
    workflowRunId: string;
    workspaceId: string;
  }) {
    const workflowRunToUpdate = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    if (isDefined(pendingAsk) && stepInfo.status === StepStatus.PENDING) {
      await this.inputAskWorkspaceService.open({
        workspaceId,
        inputAsk: {
          ...pendingAsk,
          workflowRunId,
          stepId,
          assigneeId: getRunInitiatorWorkspaceMemberId(workflowRunToUpdate),
        },
      });
    }

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
          },
        },
      },
    };

    await this.updateWorkflowRun({ workflowRunId, workspaceId, partialUpdate });
  }

  // Built from the persisted step info rather than the executor's snapshot:
  // the attempt that just failed recorded its conversation while it ran, and
  // only the stored step info carries it into the history entry.
  @WithLock('workflowRunId')
  async moveStepToRetry({
    stepId,
    error,
    workflowRunId,
    workspaceId,
  }: {
    stepId: string;
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
              threadId: undefined,
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

  // Written from the state read under the lock rather than from the caller's
  // snapshot, or a step-info write that landed in between, such as an accepted
  // form submission, would be put back as it was.
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

  // A step waiting on a person must move on exactly once. This shares the lock
  // every step-info write takes, so of two concurrent callers the second finds
  // the step no longer PENDING. A stop is refused too: endWorkflowRun turns a
  // pending step into FAILED, and a stop still waiting on another branch
  // leaves the run STOPPING with the step PENDING but nothing left to resume.
  @WithLock('workflowRunId')
  async updateStepInfoIfPending({
    stepId,
    stepInfo,
    inputAskResponse,
    workflowRunId,
    workspaceId,
  }: {
    stepId: string;
    stepInfo: Partial<WorkflowRunStepInfo>;
    inputAskResponse?: Record<string, unknown>;
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
      currentStepInfo?.status !== StepStatus.PENDING
    ) {
      return false;
    }

    // Answering the Ask under the lock that accepts the submission is the
    // claim: of two submissions only the one that answers it moves the step.
    if (
      isDefined(inputAskResponse) &&
      !(await this.inputAskWorkspaceService.answer({
        workspaceId,
        key: { workflowRunId, stepId },
        response: inputAskResponse,
      }))
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
            [stepId]: { ...currentStepInfo, ...stepInfo },
          },
        },
      },
    });

    return true;
  }

  // Answers the Ask an agent step is waiting on and hands the step back to
  // the executor, once and only for that Ask: a stop, a retry or another loop
  // iteration has moved the step on or replaced its conversation. The Ask is
  // answered under the run lock, so a run ending in between cannot cancel an
  // answer it accepts, and of two concurrent answers the second finds it
  // answered.
  @WithLock('workflowRunId')
  async resolveStepAwaitingToolCall({
    threadId,
    toolCallId,
    response,
    workflowRunId,
    workspaceId,
  }: {
    threadId: string;
    toolCallId: string;
    response: Record<string, unknown>;
    workflowRunId: string;
    workspaceId: string;
  }): Promise<StepInputResolution> {
    const workflowRunToUpdate = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    const stepInfos = workflowRunToUpdate.state?.stepInfos ?? {};
    const stepId = findStepIdByThreadId({ stepInfos, threadId });
    const currentStepInfo = isDefined(stepId) ? stepInfos[stepId] : undefined;

    if (
      workflowRunToUpdate.status !== WorkflowRunStatus.RUNNING ||
      !isDefined(stepId) ||
      !isDefined(currentStepInfo) ||
      isDefined(currentStepInfo.error) ||
      currentStepInfo.status !== StepStatus.PENDING
    ) {
      return { status: 'NOT_AWAITING' };
    }

    const hasAnswered = await this.inputAskWorkspaceService.answer({
      workspaceId,
      key: { threadId, toolCallId },
      response,
    });

    if (!hasAnswered) {
      return { status: 'NOT_AWAITING' };
    }

    await this.updateWorkflowRun({
      workflowRunId,
      workspaceId,
      partialUpdate: {
        state: {
          ...workflowRunToUpdate.state,
          stepInfos: {
            ...workflowRunToUpdate.state?.stepInfos,
            [stepId]: { ...currentStepInfo, status: StepStatus.NOT_STARTED },
          },
        },
      },
    });

    return { status: 'RESOLVED', stepId };
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
