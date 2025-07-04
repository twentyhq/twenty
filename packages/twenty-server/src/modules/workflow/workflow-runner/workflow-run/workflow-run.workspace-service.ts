import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';

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
  WorkflowRunOutput,
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

    const workflowRun = workflowRunRepository.create({
      id: workflowRunId ?? v4(),
      name: `#${workflowRunCount + 1} - ${workflow.name}`,
      workflowVersionId,
      createdBy,
      workflowId: workflow.id,
      status,
      position,
      state: this.getInitState(workflowVersion),
      context,
    });

    await workflowRunRepository.insert(workflowRun);

    return workflowRun.id;
  }

  async startWorkflowRun({
    workflowRunId,
    workspaceId,
    output,
    payload,
  }: {
    workflowRunId: string;
    workspaceId: string;
    output: WorkflowRunOutput;
    payload: object;
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
        'No workflow run to start',
        WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

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
      output,
      state: {
        ...workflowRunToUpdate.state,
        stepInfos: {
          ...workflowRunToUpdate.state?.stepInfos,
          trigger: {
            ...workflowRunToUpdate.state?.stepInfos.trigger,
            status: StepStatus.SUCCESS,
            result: payload,
          },
        },
      },
    };

    await workflowRunRepository.update(workflowRunToUpdate.id, partialUpdate);

    await this.emitWorkflowRunUpdatedEvent({
      workflowRunBefore: workflowRunToUpdate,
      updatedFields: ['status', 'startedAt', 'output'],
    });
  }

  async endWorkflowRun({
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
        'No workflow run to end',
        WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

    const partialUpdate = {
      status,
      endedAt: new Date().toISOString(),
      output: {
        ...(workflowRunToUpdate.output ?? {}),
        error,
      },
      state: {
        ...workflowRunToUpdate.state,
        workflowRunError: error,
      },
    };

    await workflowRunRepository.update(workflowRunToUpdate.id, partialUpdate);

    await this.emitWorkflowRunUpdatedEvent({
      workflowRunBefore: workflowRunToUpdate,
      updatedFields: ['status', 'endedAt', 'output', 'state'],
    });

    await this.metricsService.incrementCounter({
      key:
        status === WorkflowRunStatus.COMPLETED
          ? MetricsKeys.WorkflowRunCompleted
          : MetricsKeys.WorkflowRunFailed,
      eventId: workflowRunId,
    });
  }

  async updateWorkflowRunStepStatus({
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
        'No workflow run to save',
        WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

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

    await workflowRunRepository.update(workflowRunId, partialUpdate);

    await this.emitWorkflowRunUpdatedEvent({
      workflowRunBefore: workflowRunToUpdate,
      updatedFields: ['state'],
    });
  }

  async saveWorkflowRunState({
    workflowRunId,
    stepOutput,
    workspaceId,
    context,
    stepStatus,
  }: {
    workflowRunId: string;
    stepOutput: StepOutput;
    workspaceId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: Record<string, any>;
    stepStatus: StepStatus;
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
        'No workflow run to save',
        WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

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
            result: stepOutput.output?.result,
            error: stepOutput.output?.error,
            status: stepStatus,
          },
        },
      },
      context,
    };

    await workflowRunRepository.update(workflowRunId, partialUpdate);

    await this.emitWorkflowRunUpdatedEvent({
      workflowRunBefore: workflowRunToUpdate,
      updatedFields: ['context', 'output', 'state'],
    });
  }

  async updateWorkflowRunStep({
    workflowRunId,
    step,
    workspaceId,
  }: {
    workflowRunId: string;
    step: WorkflowAction;
    workspaceId: string;
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
        'No workflow run to update',
        WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
      );
    }

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

    await workflowRunRepository.update(workflowRunToUpdate.id, partialUpdate);

    await this.emitWorkflowRunUpdatedEvent({
      workflowRunBefore: workflowRunToUpdate,
      updatedFields: ['output', 'state'],
    });
  }

  async getWorkflowRunOrFail({
    workflowRunId,
    workspaceId,
  }: {
    workflowRunId: string;
    workspaceId: string;
  }): Promise<WorkflowRunWorkspaceEntity> {
    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowRunWorkspaceEntity>(
        workspaceId,
        'workflowRun',
        { shouldBypassPermissionChecks: true },
      );

    const workflowRun = await workflowRunRepository.findOne({
      where: { id: workflowRunId },
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
}
