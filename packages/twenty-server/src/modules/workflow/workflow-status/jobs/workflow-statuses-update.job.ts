import { Logger, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import isEqual from 'lodash.isequal';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionExceptionCode } from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatus,
  WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export enum WorkflowVersionEventType {
  CREATE = 'CREATE',
  STATUS_UPDATE = 'STATUS_UPDATE',
  DELETE = 'DELETE',
}

export type WorkflowVersionBatchEvent = {
  workspaceId: string;
} & (
  | WorkflowVersionBatchCreateEvent
  | WorkflowVersionBatchStatusUpdate
  | WorkflowVersionBatchDelete
);

export type WorkflowVersionBatchCreateEvent = {
  type: WorkflowVersionEventType.CREATE;
} & {
  workflowIds: string[];
};

export type WorkflowVersionStatusUpdate = {
  workflowId: string;
  workflowVersionId: string;
  previousStatus: WorkflowVersionStatus;
  newStatus: WorkflowVersionStatus;
};

export type WorkflowVersionBatchStatusUpdate = {
  type: WorkflowVersionEventType.STATUS_UPDATE;
} & {
  statusUpdates: WorkflowVersionStatusUpdate[];
};

export type WorkflowVersionBatchDelete = {
  type: WorkflowVersionEventType.DELETE;
} & { workflowIds: string[] };

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowStatusesUpdateJob {
  protected readonly logger = new Logger(WorkflowStatusesUpdateJob.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'core')
    protected readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(ServerlessFunctionEntity, 'core')
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
  ) {}

  @Process(WorkflowStatusesUpdateJob.name)
  async handle(event: WorkflowVersionBatchEvent): Promise<void> {
    const workflowObjectMetadata =
      await this.objectMetadataRepository.findOneOrFail({
        where: {
          nameSingular: 'workflow',
        },
      });

    switch (event.type) {
      case WorkflowVersionEventType.CREATE:
      case WorkflowVersionEventType.DELETE:
        await Promise.all(
          event.workflowIds.map((workflowId) =>
            this.handleWorkflowVersionCreatedOrDeleted({
              workflowId,
              workflowObjectMetadata,
              workspaceId: event.workspaceId,
            }),
          ),
        );
        break;
      case WorkflowVersionEventType.STATUS_UPDATE:
        await Promise.all(
          event.statusUpdates.map((statusUpdate) =>
            this.handleWorkflowVersionStatusUpdated({
              statusUpdate,
              workflowObjectMetadata,
              workspaceId: event.workspaceId,
            }),
          ),
        );
        break;
      default:
        break;
    }
  }

  private async handleWorkflowVersionCreatedOrDeleted({
    workflowId,
    workflowObjectMetadata,
    workspaceId,
  }: {
    workflowId: string;
    workflowObjectMetadata: ObjectMetadataEntity;
    workspaceId: string;
  }): Promise<void> {
    const workflowRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowWorkspaceEntity>(
        workspaceId,
        'workflow',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const newWorkflowStatuses = await this.getWorkflowStatuses({
      workflowId,
      workflowVersionRepository,
    });

    const previousWorkflow = await workflowRepository.findOneOrFail({
      where: {
        id: workflowId,
      },
    });

    if (isEqual(newWorkflowStatuses, previousWorkflow.statuses)) {
      return;
    }

    await workflowRepository.update(
      {
        id: workflowId,
      },
      {
        statuses: newWorkflowStatuses,
      },
    );

    this.emitWorkflowStatusUpdatedEvent({
      currentWorkflow: previousWorkflow,
      workflowObjectMetadata,
      newWorkflowStatuses,
      workspaceId,
    });
  }

  private async handlePublishServerlessFunction({
    statusUpdate,
    workspaceId,
    workflowVersion,
    workflowVersionRepository,
  }: {
    statusUpdate: WorkflowVersionStatusUpdate;
    workspaceId: string;
    workflowVersion: WorkflowVersionWorkspaceEntity;
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>;
  }) {
    const shouldComputeNewSteps =
      statusUpdate.newStatus === WorkflowVersionStatus.ACTIVE &&
      isDefined(workflowVersion.steps) &&
      workflowVersion.steps.filter(
        (step) => step.type === WorkflowActionType.CODE,
      ).length > 0;

    if (shouldComputeNewSteps) {
      const newSteps: WorkflowAction[] = [];

      for (const step of workflowVersion.steps || []) {
        const newStep = { ...step };

        if (step.type === WorkflowActionType.CODE) {
          try {
            await this.serverlessFunctionService.publishOneServerlessFunction(
              step.settings.input.serverlessFunctionId,
              workspaceId,
            );
          } catch (e) {
            // publishOneServerlessFunction throws if no change have been
            // applied between draft and lastPublished version.
            // If no change have been applied, we just use the same
            // serverless function version
            if (
              e.code !==
              ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_CODE_UNCHANGED
            ) {
              this.logger.error(
                `Error while publishing serverless function '${step.settings.input.serverlessFunctionId}': ${e}`,
              );
            }
          }

          const serverlessFunction =
            await this.serverlessFunctionRepository.findOneOrFail({
              where: {
                id: step.settings.input.serverlessFunctionId,
                workspaceId,
              },
            });

          const newStepSettings = { ...step.settings };

          newStepSettings.input.serverlessFunctionVersion =
            serverlessFunction.latestVersion;

          newStep.settings = newStepSettings;
        }
        newSteps.push(newStep);
      }

      await workflowVersionRepository.update(statusUpdate.workflowVersionId, {
        steps: newSteps,
      });
    }
  }

  private async handleWorkflowVersionStatusUpdated({
    statusUpdate,
    workflowObjectMetadata,
    workspaceId,
  }: {
    statusUpdate: WorkflowVersionStatusUpdate;
    workflowObjectMetadata: ObjectMetadataEntity;
    workspaceId: string;
  }): Promise<void> {
    const workflowRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowWorkspaceEntity>(
        workspaceId,
        'workflow',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflow = await workflowRepository.findOneOrFail({
      where: {
        id: statusUpdate.workflowId,
      },
    });

    const workflowVersion = await workflowVersionRepository.findOneOrFail({
      where: { id: statusUpdate.workflowVersionId },
    });

    await this.handlePublishServerlessFunction({
      workflowVersion,
      workflowVersionRepository,
      workspaceId,
      statusUpdate,
    });

    const newWorkflowStatuses = await this.getWorkflowStatuses({
      workflowId: statusUpdate.workflowId,
      workflowVersionRepository,
    });

    if (isEqual(newWorkflowStatuses, workflow.statuses)) {
      return;
    }

    await workflowRepository.update(
      {
        id: statusUpdate.workflowId,
      },
      {
        statuses: newWorkflowStatuses,
      },
    );

    this.emitWorkflowStatusUpdatedEvent({
      currentWorkflow: workflow,
      workflowObjectMetadata,
      newWorkflowStatuses,
      workspaceId,
    });
  }

  private emitWorkflowStatusUpdatedEvent({
    currentWorkflow,
    workflowObjectMetadata,
    newWorkflowStatuses,
    workspaceId,
  }: {
    currentWorkflow: WorkflowWorkspaceEntity;
    workflowObjectMetadata: ObjectMetadataEntity;
    newWorkflowStatuses: WorkflowStatus[];
    workspaceId: string;
  }) {
    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: workflowObjectMetadata.nameSingular,
      action: DatabaseEventAction.UPDATED,
      events: [
        {
          recordId: currentWorkflow.id,
          objectMetadata: workflowObjectMetadata,
          properties: {
            before: currentWorkflow,
            after: {
              ...currentWorkflow,
              statuses: newWorkflowStatuses,
            },
            updatedFields: ['statuses'],
            diff: {
              statuses: {
                before: currentWorkflow.statuses,
                after: newWorkflowStatuses,
              },
            },
          },
        },
      ],
      workspaceId,
    });
  }

  private async getWorkflowStatuses({
    workflowId,
    workflowVersionRepository,
  }: {
    workflowId: string;
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>;
  }) {
    const statuses: WorkflowStatus[] = [];

    const workflowVersions = await workflowVersionRepository.find({
      where: {
        workflowId,
        status: In([
          WorkflowVersionStatus.ACTIVE,
          WorkflowVersionStatus.DRAFT,
          WorkflowVersionStatus.DEACTIVATED,
        ]),
      },
    });

    const hasDraftVersion = workflowVersions.some(
      (version) => version.status === WorkflowVersionStatus.DRAFT,
    );

    if (hasDraftVersion) {
      statuses.push(WorkflowStatus.DRAFT);
    }

    const hasActiveVersion = workflowVersions.some(
      (version) => version.status === WorkflowVersionStatus.ACTIVE,
    );

    if (hasActiveVersion) {
      statuses.push(WorkflowStatus.ACTIVE);
    }

    const hasDeactivatedVersion = workflowVersions.some(
      (version) => version.status === WorkflowVersionStatus.DEACTIVATED,
    );

    if (!hasActiveVersion && hasDeactivatedVersion) {
      statuses.push(WorkflowStatus.DEACTIVATED);
    }

    return statuses;
  }
}
