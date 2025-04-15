import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  StepOutput,
  WorkflowRunOutput,
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

@Injectable()
export class WorkflowRunWorkspaceService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
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
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
        workflowVersionId,
      );

    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
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

    const workspaceId =
      this.scopedWorkspaceContextFactory.create()?.workspaceId;

    if (!workspaceId) {
      throw new WorkflowRunException(
        'Workspace id is invalid',
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
    context,
    output,
  }: {
    workflowRunId: string;
    context: Record<string, any>;
    output: WorkflowRunOutput;
  }) {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
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
      diff: partialUpdate,
      updatedFields: ['status', 'startedAt', 'context', 'output'],
    });
  }

  async endWorkflowRun({
    workflowRunId,
    status,
    error,
  }: {
    workflowRunId: string;
    status: WorkflowRunStatus;
    error?: string;
  }) {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
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
      diff: partialUpdate,
      updatedFields: ['status', 'endedAt', 'output'],
    });
  }

  async saveWorkflowRunState({
    workflowRunId,
    stepOutput,
    context,
  }: {
    workflowRunId: string;
    stepOutput: StepOutput;
    context: Record<string, any>;
  }) {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
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
      diff: partialUpdate,
      updatedFields: ['context', 'output'],
    });
  }

  async updateWorkflowRunStep({
    workflowRunId,
    step,
  }: {
    workflowRunId: string;
    step: WorkflowAction;
  }) {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
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
      diff: partialUpdate,
      updatedFields: ['output'],
    });
  }

  async getWorkflowRunOrFail(
    workflowRunId: string,
  ): Promise<WorkflowRunWorkspaceEntity> {
    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
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
    diff,
  }: {
    workflowRunBefore: WorkflowRunWorkspaceEntity;
    updatedFields: string[];
    diff: object;
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
    });

    if (!objectMetadata) {
      throw new WorkflowRunException(
        'Object metadata not found',
        WorkflowRunExceptionCode.FAILURE,
      );
    }

    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
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
            diff,
          },
        },
      ],
      workspaceId,
    });
  }
}
