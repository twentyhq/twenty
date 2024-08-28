import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { buildCreatedByFromWorkspaceMember } from 'src/engine/core-modules/actor/utils/build-created-by-from-workspace-member.util';
import { User } from 'src/engine/core-modules/user/user.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowTriggerType } from 'src/modules/workflow/common/types/workflow-trigger.type';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workflow-common.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-runner.workspace-service';
import { DatabaseEventTriggerService } from 'src/modules/workflow/workflow-trigger/database-event-trigger/database-event-trigger.service';
import { assertVersionCanBeActivated } from 'src/modules/workflow/workflow-trigger/utils/assert-version-can-be-activated.util';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/workflow-trigger.exception';

@Injectable()
export class WorkflowTriggerWorkspaceService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly databaseEventTriggerService: DatabaseEventTriggerService,
  ) {}

  async runWorkflowVersion(
    workflowVersionId: string,
    payload: object,
    workspaceMemberId: string,
    user: User,
  ) {
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new WorkflowTriggerException(
        'No workspace id found',
        WorkflowTriggerExceptionCode.INTERNAL_ERROR,
      );
    }

    await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
      workflowVersionId,
    );

    return await this.workflowRunnerWorkspaceService.run(
      workspaceId,
      workflowVersionId,
      payload,
      buildCreatedByFromWorkspaceMember(workspaceMemberId, user),
    );
  }

  async enableWorkflowTrigger(workflowVersionId: string) {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
        workflowVersionId,
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
      if (
        workflow.lastPublishedVersionId &&
        workflowVersionId !== workflow.lastPublishedVersionId
      ) {
        await this.disableWorkflowTriggerWithManager(
          workflow.lastPublishedVersionId,
          manager,
        );
      }

      await this.activateWorkflowVersion(
        workflowVersion.workflowId,
        workflowVersionId,
        manager,
      );
      await workflowRepository.update(
        { id: workflow.id },
        { lastPublishedVersionId: workflowVersionId },
        manager,
      );

      switch (workflowVersion.trigger.type) {
        case WorkflowTriggerType.DATABASE_EVENT:
          await this.databaseEventTriggerService.createEventListener(
            workflowVersion.workflowId,
            workflowVersion.trigger,
            manager,
          );
          break;
        default:
          break;
      }

      await queryRunner.commitTransaction();

      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async disableWorkflowTrigger(workflowVersionId: string) {
    const workspaceDataSource = await this.twentyORMManager.getDatasource();
    const queryRunner = workspaceDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.disableWorkflowTriggerWithManager(
        workflowVersionId,
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

  private async disableWorkflowTriggerWithManager(
    workflowVersionId: string,
    manager: EntityManager,
  ) {
    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: { id: workflowVersionId },
    });

    if (!workflowVersion) {
      throw new WorkflowTriggerException(
        'No workflow version found',
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    if (workflowVersion.status !== WorkflowVersionStatus.ACTIVE) {
      throw new WorkflowTriggerException(
        'Cannot disable non-active workflow version',
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    await workflowVersionRepository.update(
      { id: workflowVersionId },
      { status: WorkflowVersionStatus.DEACTIVATED },
      manager,
    );

    switch (workflowVersion?.trigger?.type) {
      case WorkflowTriggerType.DATABASE_EVENT:
        await this.databaseEventTriggerService.deleteEventListener(
          workflowVersion.workflowId,
          manager,
        );
        break;
      default:
        break;
    }
  }

  private async activateWorkflowVersion(
    workflowId: string,
    workflowVersionId: string,
    manager: EntityManager,
  ) {
    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
      );

    const activeWorkflowVersions = await workflowVersionRepository.find(
      {
        where: { workflowId, status: WorkflowVersionStatus.ACTIVE },
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
      { id: workflowVersionId },
      { status: WorkflowVersionStatus.ACTIVE },
      manager,
    );
  }
}
