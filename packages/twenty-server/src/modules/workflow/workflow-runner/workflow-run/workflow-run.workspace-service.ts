import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { objectRecordChangedValues } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-values';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  StepOutput,
  WorkflowRunState,
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { StepStatus } from 'src/modules/workflow/workflow-executor/types/workflow-run-step-info.type';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';

@Injectable()
export class WorkflowRunWorkspaceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly recordPositionService: RecordPositionService,
    private readonly metricsService: MetricsService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async createWorkflowRun({
    workflowVersionId,
    createdBy,
    workflowRunId,
    context,
    status,
  }: {
    workflowVersionId: string;
    createdBy: ActorMetadata;
    workflowRunId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: Record<string, any>;
    status: WorkflowRunStatus.NOT_STARTED | WorkflowRunStatus.ENQUEUED;
  }) {
    const workspaceId =
      this.scopedWorkspaceContextFactory.create()?.workspaceId;

    if (!workspaceId) {
      throw new WorkflowRunException(
        'Workspace id is invalid',
        WorkflowRunExceptionCode.WORKFLOW_RUN_INVALID,
      );
    }

    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowRunWorkspaceEntity>(
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
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
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

    const workflowRunCount = await workflowRunRepository.count({
      where: {
        workflowId: workflow.id,
      },
    });

    const position = await this.recordPositionService.buildRecordPosition({
      value: 'first',
      objectMetadata: {
        isCustom: false,
        nameSingular: 'workflowRun',
      },
      workspaceId,
    });

    const initState = this.getInitState(workflowVersion);

    const workflowRun = workflowRunRepository.create({
      id: workflowRunId ?? v4(),
      name: `#${workflowRunCount + 1} - ${workflow.name}`,
      workflowVersionId,
      createdBy,
      workflowId: workflow.id,
      status,
      position,
      state: initState,
      output: {
        ...initState,
        stepsOutput: {},
      },
      context,
    });

    await workflowRunRepository.insert(workflowRun);

    return workflowRun.id;
  }

  async startWorkflowRun(params: {
    workflowRunId: string;
    workspaceId: string;
    payload: object;
  }) {
    await this.cacheLockService.withLock(
      async () => await this.startWorkflowRunWithoutLock(params),
      params.workflowRunId,
    );
  }

  private async startWorkflowRunWithoutLock({
    workflowRunId,
    workspaceId,
    payload,
  }: {
    workflowRunId: string;
    workspaceId: string;
    payload: object;
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
        'Workflow run already started',
        WorkflowRunExceptionCode.INVALID_OPERATION,
      );
    }

    const partialUpdate = {
      status: WorkflowRunStatus.RUNNING,
      startedAt: new Date().toISOString(),
      output: {
        ...workflowRunToUpdate.output,
        stepsOutput: {
          trigger: {
            result: payload,
          },
        },
      },
      state: {
        ...workflowRunToUpdate.state,
        stepInfos: {
          ...workflowRunToUpdate.state?.stepInfos,
          trigger: {
            status: StepStatus.SUCCESS,
            result: payload,
          },
        },
      },
      context: payload
        ? {
            trigger: payload,
          }
        : (workflowRunToUpdate.context ?? {}),
    };

    await this.updateWorkflowRun({ workflowRunId, workspaceId, partialUpdate });
  }

  async endWorkflowRun(params: {
    workflowRunId: string;
    workspaceId: string;
    status: WorkflowRunStatus;
    error?: string;
  }) {
    await this.cacheLockService.withLock(
      async () => await this.endWorkflowRunWithoutLock(params),
      params.workflowRunId,
    );
  }

  private async endWorkflowRunWithoutLock({
    workflowRunId,
    workspaceId,
    status,
    error,
  }: {
    workflowRunId: string;
    workspaceId: string;
    status: WorkflowRunStatus;
    error?: string;
  }) {
    const workflowRunToUpdate = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    const partialUpdate = {
      status,
      endedAt: new Date().toISOString(),
      output: {
        ...workflowRunToUpdate.output,
        error,
      },
      state: {
        ...workflowRunToUpdate.state,
        workflowRunError: error,
      },
    };

    await this.updateWorkflowRun({ workflowRunId, workspaceId, partialUpdate });

    await this.metricsService.incrementCounter({
      key:
        status === WorkflowRunStatus.COMPLETED
          ? MetricsKeys.WorkflowRunCompleted
          : MetricsKeys.WorkflowRunFailed,
      eventId: workflowRunId,
    });
  }

  async updateWorkflowRunStepStatus(params: {
    workflowRunId: string;
    stepId: string;
    workspaceId: string;
    stepStatus: StepStatus;
  }) {
    await this.cacheLockService.withLock(
      async () => await this.updateWorkflowRunStepStatusWithoutLock(params),
      params.workflowRunId,
    );
  }

  private async updateWorkflowRunStepStatusWithoutLock({
    workflowRunId,
    workspaceId,
    stepId,
    stepStatus,
  }: {
    workflowRunId: string;
    stepId: string;
    workspaceId: string;
    stepStatus: StepStatus;
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
            ...(workflowRunToUpdate.state?.stepInfos?.[stepId] || {}),
            status: stepStatus,
          },
        },
      },
    };

    await this.updateWorkflowRun({ workflowRunId, workspaceId, partialUpdate });
  }

  async saveWorkflowRunState(params: {
    workflowRunId: string;
    stepOutput: StepOutput;
    workspaceId: string;
    stepStatus: StepStatus;
  }) {
    await this.cacheLockService.withLock(
      async () => await this.saveWorkflowRunStateWithoutLock(params),
      params.workflowRunId,
    );
  }

  private async saveWorkflowRunStateWithoutLock({
    workflowRunId,
    stepOutput,
    workspaceId,
    stepStatus,
  }: {
    workflowRunId: string;
    stepOutput: StepOutput;
    workspaceId: string;
    stepStatus: StepStatus;
  }) {
    const workflowRunToUpdate = await this.getWorkflowRunOrFail({
      workflowRunId,
      workspaceId,
    });

    const partialUpdate = {
      output: {
        flow: workflowRunToUpdate.output?.flow ?? {
          trigger: undefined,
          steps: [],
        },
        stepsOutput: {
          ...(workflowRunToUpdate.output?.stepsOutput ?? {}),
          [stepOutput.id]: stepOutput.output,
        },
      },
      state: {
        ...workflowRunToUpdate.state,
        stepInfos: {
          ...workflowRunToUpdate.state?.stepInfos,
          [stepOutput.id]: {
            ...(workflowRunToUpdate.state?.stepInfos[stepOutput.id] || {}),
            result: stepOutput.output?.result,
            error: stepOutput.output?.error,
            status: stepStatus,
          },
        },
      },
      ...(stepStatus === StepStatus.SUCCESS
        ? {
            context: {
              ...workflowRunToUpdate.context,
              [stepOutput.id]: stepOutput.output.result,
            },
          }
        : {}),
    };

    await this.updateWorkflowRun({ workflowRunId, workspaceId, partialUpdate });
  }

  async updateWorkflowRunStep(params: {
    workflowRunId: string;
    step: WorkflowAction;
    workspaceId: string;
  }) {
    await this.cacheLockService.withLock(
      async () => await this.updateWorkflowRunStepWithoutLock(params),
      params.workflowRunId,
    );
  }

  private async updateWorkflowRunStepWithoutLock({
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

    const updatedSteps = workflowRunToUpdate.output?.flow?.steps?.map(
      (existingStep) => (step.id === existingStep.id ? step : existingStep),
    );

    const partialUpdate = {
      output: {
        ...(workflowRunToUpdate.output ?? {}),
        flow: {
          ...(workflowRunToUpdate.output?.flow ?? {}),
          steps: updatedSteps,
        },
      },
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
    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowRunWorkspaceEntity>(
        workspaceId,
        'workflowRun',
        { shouldBypassPermissionChecks: true },
      );

    return await workflowRunRepository.findOne({
      where: { id: workflowRunId },
    });
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

  private async emitWorkflowRunUpdatedEvent({
    workflowRunBefore,
    updatedFields,
  }: {
    workflowRunBefore: WorkflowRunWorkspaceEntity;
    updatedFields: string[];
  }) {
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      return;
    }

    const objectMetadata = await this.objectMetadataRepository.findOne({
      where: {
        nameSingular: 'workflowRun',
        workspaceId,
      },
      relations: ['fields'],
    });

    if (!objectMetadata) {
      throw new WorkflowRunException(
        'Object metadata not found',
        WorkflowRunExceptionCode.FAILURE,
      );
    }

    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'workflowRun',
        { shouldBypassPermissionChecks: true },
      );

    const workflowRunAfter = await workflowRunRepository.findOneBy({
      id: workflowRunBefore.id,
    });

    if (!workflowRunAfter) {
      throw new WorkflowRunException(
        'WorkflowRun not found',
        WorkflowRunExceptionCode.FAILURE,
      );
    }

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'workflowRun',
      action: DatabaseEventAction.UPDATED,
      events: [
        {
          recordId: workflowRunBefore.id,
          objectMetadata,
          properties: {
            after: workflowRunAfter,
            before: workflowRunBefore,
            updatedFields,
            diff: objectRecordChangedValues(
              workflowRunBefore,
              workflowRunAfter,
              updatedFields,
              objectMetadata,
            ),
          },
        },
      ],
      workspaceId,
    });
  }

  private getInitState(
    workflowVersion: WorkflowVersionWorkspaceEntity,
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
        trigger: { status: StepStatus.NOT_STARTED },
        ...Object.fromEntries(
          workflowVersion.steps.map((step) => [
            step.id,
            { status: StepStatus.NOT_STARTED },
          ]),
        ),
      },
    };
  }

  private async updateWorkflowRun({
    workflowRunId,
    workspaceId,
    partialUpdate,
  }: {
    workflowRunId: string;
    workspaceId: string;
    partialUpdate: QueryDeepPartialEntity<WorkflowRunWorkspaceEntity>;
  }) {
    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowRunWorkspaceEntity>(
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

    await workflowRunRepository.update(workflowRunToUpdate.id, partialUpdate);

    const updatedFields = Object.keys(partialUpdate);

    if (updatedFields.length > 0) {
      await this.emitWorkflowRunUpdatedEvent({
        workflowRunBefore: workflowRunToUpdate,
        updatedFields: updatedFields,
      });
    }
  }
}
