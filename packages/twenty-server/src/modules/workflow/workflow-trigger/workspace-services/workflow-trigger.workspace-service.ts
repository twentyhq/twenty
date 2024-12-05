import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { EntityManager, Repository } from 'typeorm';

import { buildCreatedByFromWorkspaceMember } from 'src/engine/core-modules/actor/utils/build-created-by-from-workspace-member.util';
import { User } from 'src/engine/core-modules/user/user.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { assertWorkflowVersionTriggerIsDefined } from 'src/modules/workflow/common/utils/assert-workflow-version-trigger-is-defined.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { DatabaseEventTriggerService } from 'src/modules/workflow/workflow-trigger/database-event-trigger/database-event-trigger.service';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { assertVersionCanBeActivated } from 'src/modules/workflow/workflow-trigger/utils/assert-version-can-be-activated.util';
import { assertNever } from 'src/utils/assert';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { WORKFLOW_VERSION_STATUS_UPDATED } from 'src/modules/workflow/workflow-status/constants/workflow-version-status-updated.constants';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkflowVersionStatusUpdate } from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';

@Injectable()
export class WorkflowTriggerWorkspaceService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly databaseEventTriggerService: DatabaseEventTriggerService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  private getWorkspaceId() {
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new WorkflowTriggerException(
        'No workspace id found',
        WorkflowTriggerExceptionCode.INTERNAL_ERROR,
      );
    }

    return workspaceId;
  }

  async runWorkflowVersion(
    workflowVersionId: string,
    payload: object,
    workspaceMemberId: string,
    user: User,
  ) {
    await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
      workflowVersionId,
    );

    return await this.workflowRunnerWorkspaceService.run(
      this.getWorkspaceId(),
      workflowVersionId,
      payload,
      buildCreatedByFromWorkspaceMember(workspaceMemberId, user),
    );
  }

  async activateWorkflowVersion(workflowVersionId: string) {
    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
      );

    const workflowVersionNullable = await workflowVersionRepository.findOne({
      where: { id: workflowVersionId },
    });

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getValidWorkflowVersionOrFail(
        workflowVersionNullable,
      );

    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
      );

    const workflow = await workflowRepository.findOne({
      where: { id: workflowVersion.workflowId },
    });

    if (!workflow) {
      throw new WorkflowTriggerException(
        'No workflow found',
        WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
      );
    }

    assertVersionCanBeActivated(workflowVersion, workflow);

    const workspaceDataSource = await this.twentyORMManager.getDatasource();
    const queryRunner = workspaceDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;

    try {
      await this.performActivationSteps(
        workflow,
        workflowVersion,
        workflowRepository,
        workflowVersionRepository,
        manager,
      );

      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deactivateWorkflowVersion(workflowVersionId: string) {
    const workspaceDataSource = await this.twentyORMManager.getDatasource();
    const queryRunner = workspaceDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const workflowVersionRepository =
        await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
        );

      await this.performDeactivationSteps(
        workflowVersionId,
        workflowVersionRepository,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async performActivationSteps(
    workflow: WorkflowWorkspaceEntity,
    workflowVersion: WorkflowVersionWorkspaceEntity,
    workflowRepository: WorkspaceRepository<WorkflowWorkspaceEntity>,
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>,
    manager: EntityManager,
  ) {
    if (
      workflow.lastPublishedVersionId &&
      workflowVersion.id !== workflow.lastPublishedVersionId
    ) {
      await this.performDeactivationSteps(
        workflow.lastPublishedVersionId,
        workflowVersionRepository,
        manager,
      );
    }

    await this.upgradeWorkflowVersion(
      workflow,
      workflowVersion.id,
      workflowRepository,
      workflowVersionRepository,
      manager,
    );

    await this.setActiveVersionStatus(
      workflowVersion,
      workflowVersionRepository,
      manager,
    );

    await this.enableTrigger(workflowVersion, manager);
  }

  private async performDeactivationSteps(
    workflowVersionId: string,
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>,
    manager: EntityManager,
  ) {
    const workflowVersionNullable = await workflowVersionRepository.findOne({
      where: { id: workflowVersionId },
    });

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getValidWorkflowVersionOrFail(
        workflowVersionNullable,
      );

    if (workflowVersion.status !== WorkflowVersionStatus.ACTIVE) {
      return;
    }

    await this.setDeactivatedVersionStatus(
      workflowVersion,
      workflowVersionRepository,
      manager,
    );

    await this.disableTrigger(workflowVersion, manager);
  }

  private async setActiveVersionStatus(
    workflowVersion: WorkflowVersionWorkspaceEntity,
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>,
    manager: EntityManager,
  ) {
    const activeWorkflowVersions = await workflowVersionRepository.find(
      {
        where: {
          workflowId: workflowVersion.workflowId,
          status: WorkflowVersionStatus.ACTIVE,
        },
      },
      manager,
    );

    if (activeWorkflowVersions.length > 0) {
      throw new WorkflowTriggerException(
        'Cannot have more than one active workflow version',
        WorkflowTriggerExceptionCode.FORBIDDEN,
      );
    }

    await workflowVersionRepository.update(
      { id: workflowVersion.id },
      { status: WorkflowVersionStatus.ACTIVE },
      manager,
    );

    await this.emitStatusUpdateEvents(
      workflowVersion,
      WorkflowVersionStatus.ACTIVE,
      this.getWorkspaceId(),
    );
  }

  private async setDeactivatedVersionStatus(
    workflowVersion: WorkflowVersionWorkspaceEntity,
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>,
    manager: EntityManager,
  ) {
    if (workflowVersion.status !== WorkflowVersionStatus.ACTIVE) {
      throw new WorkflowTriggerException(
        'Cannot disable non-active workflow version',
        WorkflowTriggerExceptionCode.FORBIDDEN,
      );
    }

    await workflowVersionRepository.update(
      { id: workflowVersion.id },
      { status: WorkflowVersionStatus.DEACTIVATED },
      manager,
    );

    await this.emitStatusUpdateEvents(
      workflowVersion,
      WorkflowVersionStatus.DEACTIVATED,
      this.getWorkspaceId(),
    );
  }

  private async upgradeWorkflowVersion(
    workflow: WorkflowWorkspaceEntity,
    newPublishedVersionId: string,
    workflowRepository: WorkspaceRepository<WorkflowWorkspaceEntity>,
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>,
    manager: EntityManager,
  ) {
    if (workflow.lastPublishedVersionId === newPublishedVersionId) {
      return;
    }

    if (workflow.lastPublishedVersionId) {
      await workflowVersionRepository.update(
        { id: workflow.lastPublishedVersionId },
        { status: WorkflowVersionStatus.ARCHIVED },
        manager,
      );
    }

    await workflowRepository.update(
      { id: workflow.id },
      { lastPublishedVersionId: newPublishedVersionId },
      manager,
    );
  }

  private async enableTrigger(
    workflowVersion: WorkflowVersionWorkspaceEntity,
    manager: EntityManager,
  ) {
    assertWorkflowVersionTriggerIsDefined(workflowVersion);

    switch (workflowVersion.trigger.type) {
      case WorkflowTriggerType.DATABASE_EVENT:
        await this.databaseEventTriggerService.createEventListener(
          workflowVersion.workflowId,
          workflowVersion.trigger,
          manager,
        );

        return;
      case WorkflowTriggerType.MANUAL:
        return;
      default: {
        assertNever(workflowVersion.trigger);
      }
    }
  }

  private async disableTrigger(
    workflowVersion: WorkflowVersionWorkspaceEntity,
    manager: EntityManager,
  ) {
    assertWorkflowVersionTriggerIsDefined(workflowVersion);

    switch (workflowVersion.trigger.type) {
      case WorkflowTriggerType.DATABASE_EVENT:
        await this.databaseEventTriggerService.deleteEventListener(
          workflowVersion.workflowId,
          manager,
        );

        return;
      case WorkflowTriggerType.MANUAL:
        return;
      default:
        assertNever(workflowVersion.trigger);
    }
  }

  private async emitStatusUpdateEvents(
    workflowVersion: WorkflowVersionWorkspaceEntity,
    newStatus: WorkflowVersionStatus,
    workspaceId: string,
  ) {
    const objectMetadata = await this.objectMetadataRepository.findOneOrFail({
      where: {
        nameSingular: 'workflowVersion',
      },
    });

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: 'workflowVersion',
      action: DatabaseEventAction.UPDATED,
      events: [
        {
          recordId: workflowVersion.id,
          objectMetadata,
          properties: {
            before: workflowVersion,
            after: { ...workflowVersion, status: newStatus },
            updatedFields: ['status'],
            diff: {
              status: { before: workflowVersion.status, after: newStatus },
            },
          },
        },
      ],
      workspaceId,
    });

    this.workspaceEventEmitter.emitCustomBatchEvent<WorkflowVersionStatusUpdate>(
      WORKFLOW_VERSION_STATUS_UPDATED,
      [
        {
          workflowId: workflowVersion.workflowId,
          workflowVersionId: workflowVersion.id,
          previousStatus: workflowVersion.status,
          newStatus,
        },
      ],
      workspaceId,
    );
  }
}
