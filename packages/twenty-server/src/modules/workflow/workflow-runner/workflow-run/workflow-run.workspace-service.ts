import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { objectRecordChangedValues } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-values';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  StepOutput,
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
  ) {}

  async createWorkflowRun({
    workflowVersionId,
    createdBy,
  }: {
    workflowVersionId: string;
    createdBy: ActorMetadata;
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
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
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

    return (
      await workflowRunRepository.save({
        name: `#${workflowRunCount + 1} - ${workflow.name}`,
        workflowVersionId,
        createdBy,
        workflowId: workflow.id,
        status: WorkflowRunStatus.NOT_STARTED,
        position,
      })
    ).id;
  }

  async startWorkflowRun({
    workflowRunId,
    workspaceId,
    context,
    output,
  }: {
    workflowRunId: string;
    workspaceId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: Record<string, any>;
    output: WorkflowRunOutput;
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

    if (workflowRunToUpdate.status !== WorkflowRunStatus.NOT_STARTED) {
      throw new WorkflowRunException(
        'Workflow run already started',
        WorkflowRunExceptionCode.INVALID_OPERATION,
      );
    }

    const partialUpdate = {
      status: WorkflowRunStatus.RUNNING,
      startedAt: new Date().toISOString(),
      context,
      output,
    };

    await workflowRunRepository.update(workflowRunToUpdate.id, partialUpdate);

    await this.emitWorkflowRunUpdatedEvent({
      workflowRunBefore: workflowRunToUpdate,
      updatedFields: ['status', 'startedAt', 'context', 'output'],
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
    };

    await workflowRunRepository.update(workflowRunToUpdate.id, partialUpdate);

    await this.emitWorkflowRunUpdatedEvent({
      workflowRunBefore: workflowRunToUpdate,
      updatedFields: ['status', 'endedAt', 'output'],
    });
  }

  async saveWorkflowRunState({
    workflowRunId,
    stepOutput,
    workspaceId,
    context,
  }: {
    workflowRunId: string;
    stepOutput: StepOutput;
    workspaceId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: Record<string, any>;
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
      context,
    };

    await workflowRunRepository.update(workflowRunId, partialUpdate);

    await this.emitWorkflowRunUpdatedEvent({
      workflowRunBefore: workflowRunToUpdate,
      updatedFields: ['context', 'output'],
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
    };

    await workflowRunRepository.update(workflowRunToUpdate.id, partialUpdate);

    await this.emitWorkflowRunUpdatedEvent({
      workflowRunBefore: workflowRunToUpdate,
      updatedFields: ['output'],
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
}
