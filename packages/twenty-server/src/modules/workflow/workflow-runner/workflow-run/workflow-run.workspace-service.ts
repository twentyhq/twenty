import { Injectable } from '@nestjs/common';

import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfo } from 'twenty-shared/workflow';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v4 } from 'uuid';

import { WithLock } from 'src/engine/core-modules/cache-lock/with-lock.decorator';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowRunStatus,
  type WorkflowRunState,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';

@Injectable()
export class WorkflowRunWorkspaceService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly recordPositionService: RecordPositionService,
    private readonly metricsService: MetricsService,
  ) {}

  async createWorkflowRun({
    workflowVersionId,
    createdBy,
    workflowRunId,
    status,
    triggerPayload,
    error,
    workspaceId,
  }: {
    workflowVersionId: string;
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

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowRunRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
            workspaceId,
            'workflowRun',
            { shouldBypassPermissionChecks: true },
          );

        const workflowVersion =
          await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
            workspaceId,
            workflowVersionId,
          });

        const workflowRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            'workflow',
            { shouldBypassPermissionChecks: true },
          );

        const workflow = await workflowRepository.findOne({
          where: {
            id: workflowVersion.workflowId,
          },
        });

        if (!workflow) {
          throw new WorkflowRunException(
            'Workflow id is invalid',
            WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID,
          );
        }

        const position = await this.recordPositionService.buildRecordPosition({
          value: 'first',
          objectMetadata: {
            isCustom: false,
            nameSingular: 'workflowRun',
          },
          workspaceId,
        });

        const initState = this.getInitState(
          workflowVersion,
          triggerPayload,
          error,
        );

        const lastWorkflowRun = await workflowRunRepository.findOne({
          where: {
            workflowId: workflow.id,
          },
          order: { createdAt: 'desc' },
        });

        const workflowRunCountMatch = lastWorkflowRun?.name?.match(/#(\d+)/);

        const workflowRunCount = workflowRunCountMatch
          ? parseInt(workflowRunCountMatch[1], 10)
          : 0;

        const workflowRun = {
          id: workflowRunId ?? v4(),
          name: `#${workflowRunCount + 1} - ${workflow.name}`,
          workflowVersionId,
          createdBy,
          workflowId: workflow.id,
          status,
          position,
          state: initState,
          enqueuedAt: status === WorkflowRunStatus.ENQUEUED ? new Date() : null,
        };

        await workflowRunRepository.insert(workflowRun);

        return workflowRun.id;
      },
    );
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
      return;
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
  }: {
    workflowRunId: string;
    workspaceId: string;
    status: Extract<WorkflowRunStatus, 'COMPLETED' | 'FAILED' | 'STOPPED'>;
    error?: string;
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

    await this.metricsService.incrementCounter({
      key:
        status === WorkflowRunStatus.COMPLETED
          ? MetricsKeys.WorkflowRunCompleted
          : status === WorkflowRunStatus.STOPPED
            ? MetricsKeys.WorkflowRunStopped
            : MetricsKeys.WorkflowRunFailed,
      eventId: workflowRunId,
    });
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
            ...(workflowRunToUpdate.state?.stepInfos[stepId] || {}),
            result: stepInfo?.result,
            error: stepInfo?.error,
            status: stepInfo.status,
          },
        },
      },
    };

    await this.updateWorkflowRun({ workflowRunId, workspaceId, partialUpdate });
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

    const partialUpdate = {
      state: {
        ...workflowRunToUpdate.state,
        stepInfos: {
          ...workflowRunToUpdate.state?.stepInfos,
          ...stepInfos,
        },
      },
    };

    await this.updateWorkflowRun({
      workflowRunId,
      workspaceId,
      partialUpdate,
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
          ...(workflowRunToUpdate.state?.flow ?? {}),
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

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowRunRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
            workspaceId,
            'workflowRun',
            { shouldBypassPermissionChecks: true },
          );

        return await workflowRunRepository.findOne({
          where: { id: workflowRunId },
        });
      },
    );
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
    partialUpdate: QueryDeepPartialEntity<WorkflowRunWorkspaceEntity>;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowRunRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
            workspaceId,
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

        await workflowRunRepository.update(
          workflowRunToUpdate.id,
          partialUpdate,
          undefined,
          ['id'],
        );
      },
    );
  }

  private getInitState(
    workflowVersion: WorkflowVersionWorkspaceEntity,
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
