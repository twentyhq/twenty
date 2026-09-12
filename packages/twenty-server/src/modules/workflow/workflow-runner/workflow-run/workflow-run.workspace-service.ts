import { Injectable } from '@nestjs/common';

import { type ActorMetadata, type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfo } from 'twenty-shared/workflow';
import { v4 } from 'uuid';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { WithLock } from 'src/engine/core-modules/cache-lock/with-lock.decorator';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/twenty-orm/utils/format-twenty-orm-event-to-database-batch-event.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  WorkflowRunStatus,
  type WorkflowRunState,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import {
  buildMergeWorkflowRunStepInfosStatement,
  type WorkflowRunStepInfoPatchByStepId,
} from 'src/modules/workflow/workflow-runner/workflow-run/utils/build-merge-workflow-run-step-infos-statement.util';

@Injectable()
export class WorkflowRunWorkspaceService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
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

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRunRepository =
        this.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
          'workflowRun',
          { shouldBypassPermissionChecks: true },
        );

      const workflowVersion =
        await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
          workspaceId,
          workflowVersionId,
        });

      const workflowRepository =
        this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
          'workflow',
          {
            shouldBypassPermissionChecks: true,
          },
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
        order: { createdAt: 'DESC' },
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
        coreWorkflowId: workflow.coreWorkflowId,
        coreWorkflowVersionId: workflowVersion.coreWorkflowVersionId,
        status,
        position,
        state: initState,
        enqueuedAt: status === WorkflowRunStatus.ENQUEUED ? new Date() : null,
      };

      await workflowRunRepository.insert(workflowRun);

      return workflowRun.id;
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
    await this.mergeWorkflowRunStepInfos({
      workflowRunId,
      workspaceId,
      // Only these three keys are the caller's to say; whatever else the step
      // info already carries (history, retryAttempt) survives the merge
      stepInfoPatchByStepId: {
        [stepId]: {
          result: stepInfo?.result,
          error: stepInfo?.error,
          status: stepInfo.status,
        },
      },
    });
  }

  async updateWorkflowRunStepInfos({
    stepInfos,
    workflowRunId,
    workspaceId,
  }: {
    stepInfos: Record<string, WorkflowRunStepInfo>;
    workflowRunId: string;
    workspaceId: string;
  }) {
    await this.mergeWorkflowRunStepInfos({
      workflowRunId,
      workspaceId,
      stepInfoPatchByStepId: stepInfos,
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

      // The run state carries the whole flow definition, so an existence read
      // here doubles the bytes fetched on a path every step takes twice
      const { affected } = await workflowRunRepository.update(
        workflowRunId,
        partialUpdate,
      );

      if (affected === 0) {
        throw new WorkflowRunException(
          `workflowRun ${workflowRunId} not found`,
          WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
        );
      }
    }, authContext);
  }

  // A step-status write used to read the run, rebuild the whole state column —
  // flow definition included — and push it back under a run-wide mutex. The
  // targeted jsonb merge below leaves the flow bytes untouched and lets
  // Postgres serialise concurrent branches on the row itself.
  private async mergeWorkflowRunStepInfos({
    workflowRunId,
    workspaceId,
    stepInfoPatchByStepId,
  }: {
    workflowRunId: string;
    workspaceId: string;
    stepInfoPatchByStepId: WorkflowRunStepInfoPatchByStepId;
  }) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRunRepository =
        this.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
          'workflowRun',
          { shouldBypassPermissionChecks: true },
        );

      const { sql, parameters } = buildMergeWorkflowRunStepInfosStatement({
        schemaName: getWorkspaceSchemaName(workspaceId),
        workflowRunId,
        stepInfoPatchByStepId,
      });

      const [mutatedRow] = await workflowRunRepository.executeRaw<
        Record<string, unknown>
      >(sql, parameters);

      if (!isDefined(mutatedRow)) {
        throw new WorkflowRunException(
          `workflowRun ${workflowRunId} not found`,
          WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
        );
      }

      this.emitWorkflowRunUpdatedEvent({
        workflowRunRepository,
        mutatedRow,
        authContext,
      });
    }, authContext);
  }

  // Writing outside the ORM skips the batch event it would have emitted, and
  // the front-end's live run progress rides on that event
  private emitWorkflowRunUpdatedEvent({
    workflowRunRepository,
    mutatedRow,
    authContext,
  }: {
    workflowRunRepository: WorkspaceRepository<WorkflowRunWorkspaceEntity>;
    mutatedRow: Record<string, unknown>;
    authContext: RawAuthContext;
  }) {
    const { internalContext } = workflowRunRepository;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: internalContext.objectIdByNameSingular.workflowRun,
      flatEntityMaps: internalContext.flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return;
    }

    const {
      previousState,
      previousUpdatedAt,
      ...columnsAfter
    }: Record<string, unknown> = mutatedRow;

    const [recordBefore, recordAfter] = workflowRunRepository.formatResult<
      ObjectRecord[]
    >([
      { ...columnsAfter, state: previousState, updatedAt: previousUpdatedAt },
      columnsAfter,
    ]);

    internalContext.eventEmitterService.emitDatabaseBatchEvent(
      formatTwentyOrmEventToDatabaseBatchEvent({
        action: DatabaseEventAction.UPDATED,
        objectMetadataItem: flatObjectMetadata,
        flatFieldMetadataMaps: internalContext.flatFieldMetadataMaps,
        workspaceId: internalContext.workspaceId,
        authContext,
        recordsBefore: [recordBefore],
        recordsAfter: [recordAfter],
      }),
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
