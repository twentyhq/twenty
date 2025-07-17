import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';

import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { assertWorkflowVersionTriggerIsDefined } from 'src/modules/workflow/common/utils/assert-workflow-version-trigger-is-defined.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { WORKFLOW_VERSION_STATUS_UPDATED } from 'src/modules/workflow/workflow-status/constants/workflow-version-status-updated.constants';
import { WorkflowVersionStatusUpdate } from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';
import { AutomatedTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.workspace-service';
import { DatabaseEventTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { assertVersionCanBeActivated } from 'src/modules/workflow/workflow-trigger/utils/assert-version-can-be-activated.util';
import { computeCronPatternFromSchedule } from 'src/modules/workflow/workflow-trigger/utils/compute-cron-pattern-from-schedule';
import { assertNever } from 'src/utils/assert';

@Injectable()
export class WorkflowTriggerWorkspaceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly automatedTriggerWorkspaceService: AutomatedTriggerWorkspaceService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
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

  async runWorkflowVersion({
    workflowVersionId,
    payload,
    createdBy,
    workflowRunId,
  }: {
    workflowVersionId: string;
    payload: object;
    createdBy: ActorMetadata;
    workflowRunId?: string;
  }) {
    await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
      workflowVersionId,
      workspaceId: this.getWorkspaceId(),
    });

    return this.workflowRunnerWorkspaceService.run({
      workspaceId: this.getWorkspaceId(),
      workflowRunId,
      workflowVersionId,
      payload,
      source: createdBy,
    });
  }

  async activateWorkflowVersion(workflowVersionId: string) {
    const workspaceId = this.getWorkspaceId();
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        this.getWorkspaceId(),
        'workflowVersion',
        { shouldBypassPermissionChecks: true }, // settings permissions are checked at resolver-level
      );

    const workflowVersionNullable = await workflowVersionRepository.findOne({
      where: { id: workflowVersionId },
    });

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getValidWorkflowVersionOrFail(
        workflowVersionNullable,
      );

    const workflowRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowWorkspaceEntity>(
        workspaceId,
        'workflow',
        { shouldBypassPermissionChecks: true }, // settings permissions are checked at resolver-level
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

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId: this.getWorkspaceId(),
      });
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
    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId: this.getWorkspaceId(),
      });
    const queryRunner = workspaceDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const workflowVersionRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
          this.getWorkspaceId(),
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
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
    manager: WorkspaceEntityManager,
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
    manager: WorkspaceEntityManager,
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
    manager: WorkspaceEntityManager,
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
        {
          userFriendlyMessage: t`Cannot have more than one active workflow version`,
        },
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
    manager: WorkspaceEntityManager,
  ) {
    if (workflowVersion.status !== WorkflowVersionStatus.ACTIVE) {
      throw new WorkflowTriggerException(
        'Cannot disable non-active workflow version',
        WorkflowTriggerExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: t`Cannot disable non-active workflow version`,
        },
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
    manager: WorkspaceEntityManager,
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
    manager: WorkspaceEntityManager,
  ) {
    assertWorkflowVersionTriggerIsDefined(workflowVersion);

    switch (workflowVersion.trigger.type) {
      case WorkflowTriggerType.MANUAL:
      case WorkflowTriggerType.WEBHOOK:
        return;
      case WorkflowTriggerType.DATABASE_EVENT: {
        const settings = workflowVersion.trigger
          .settings as DatabaseEventTriggerSettings;

        await this.automatedTriggerWorkspaceService.addAutomatedTrigger({
          workflowId: workflowVersion.workflowId,
          type: AutomatedTriggerType.DATABASE_EVENT,
          settings,
          manager,
        });

        return;
      }
      case WorkflowTriggerType.CRON: {
        const pattern = computeCronPatternFromSchedule(workflowVersion.trigger);

        await this.automatedTriggerWorkspaceService.addAutomatedTrigger({
          workflowId: workflowVersion.workflowId,
          type: AutomatedTriggerType.CRON,
          settings: { pattern },
          manager,
        });

        return;
      }
      default: {
        assertNever(workflowVersion.trigger);
      }
    }
  }

  private async disableTrigger(
    workflowVersion: WorkflowVersionWorkspaceEntity,
    manager: WorkspaceEntityManager,
  ) {
    assertWorkflowVersionTriggerIsDefined(workflowVersion);

    switch (workflowVersion.trigger.type) {
      case WorkflowTriggerType.DATABASE_EVENT:
      case WorkflowTriggerType.CRON:
        await this.automatedTriggerWorkspaceService.deleteAutomatedTrigger({
          workflowId: workflowVersion.workflowId,
          manager,
        });

        return;
      case WorkflowTriggerType.MANUAL:
      case WorkflowTriggerType.WEBHOOK:
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
