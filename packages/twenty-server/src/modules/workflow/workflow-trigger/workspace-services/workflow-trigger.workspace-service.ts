import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type ActorMetadata } from 'twenty-shared/types';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { assertWorkflowVersionTriggerIsDefined } from 'src/modules/workflow/common/utils/assert-workflow-version-trigger-is-defined.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { WORKFLOW_VERSION_STATUS_UPDATED } from 'src/modules/workflow/workflow-status/constants/workflow-version-status-updated.constants';
import { type WorkflowVersionStatusUpdate } from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';
import { AutomatedTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.workspace-service';
import { type DatabaseEventTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
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

    await this.performActivationSteps(
      workflow,
      workflowVersion,
      workflowRepository,
      workflowVersionRepository,
    );

    return true;
  }

  async deactivateWorkflowVersion(workflowVersionId: string) {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        this.getWorkspaceId(),
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    await this.performDeactivationSteps(
      workflowVersionId,
      workflowVersionRepository,
    );

    return true;
  }

  async stopWorkflowRun(workflowRunId: string) {
    return this.workflowRunnerWorkspaceService.stopWorkflowRun(
      this.getWorkspaceId(),
      workflowRunId,
    );
  }

  private async performActivationSteps(
    workflow: WorkflowWorkspaceEntity,
    workflowVersion: WorkflowVersionWorkspaceEntity,
    workflowRepository: WorkspaceRepository<WorkflowWorkspaceEntity>,
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>,
  ) {
    if (
      workflow.lastPublishedVersionId &&
      workflowVersion.id !== workflow.lastPublishedVersionId
    ) {
      await this.performDeactivationSteps(
        workflow.lastPublishedVersionId,
        workflowVersionRepository,
      );
    }

    await this.upgradeWorkflowVersion(
      workflow,
      workflowVersion.id,
      workflowRepository,
      workflowVersionRepository,
    );

    await this.setActiveVersionStatus(
      workflowVersion,
      workflowVersionRepository,
    );

    await this.enableTrigger(workflowVersion);
  }

  private async performDeactivationSteps(
    workflowVersionId: string,
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>,
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
    );

    await this.disableTrigger(workflowVersion);
  }

  private async setActiveVersionStatus(
    workflowVersion: WorkflowVersionWorkspaceEntity,
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>,
  ) {
    const activeWorkflowVersions = await workflowVersionRepository.find({
      where: {
        workflowId: workflowVersion.workflowId,
        status: WorkflowVersionStatus.ACTIVE,
      },
    });

    if (activeWorkflowVersions.length > 0) {
      throw new WorkflowTriggerException(
        'Cannot have more than one active workflow version',
        WorkflowTriggerExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Cannot have more than one active workflow version`,
        },
      );
    }

    await workflowVersionRepository.update(
      { id: workflowVersion.id },
      { status: WorkflowVersionStatus.ACTIVE },
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
  ) {
    if (workflowVersion.status !== WorkflowVersionStatus.ACTIVE) {
      throw new WorkflowTriggerException(
        'Cannot disable non-active workflow version',
        WorkflowTriggerExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`Cannot disable non-active workflow version`,
        },
      );
    }

    await workflowVersionRepository.update(
      { id: workflowVersion.id },
      { status: WorkflowVersionStatus.DEACTIVATED },
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
  ) {
    if (workflow.lastPublishedVersionId === newPublishedVersionId) {
      return;
    }

    if (workflow.lastPublishedVersionId) {
      await workflowVersionRepository.update(
        { id: workflow.lastPublishedVersionId },
        { status: WorkflowVersionStatus.ARCHIVED },
      );
    }

    await workflowRepository.update(
      { id: workflow.id },
      { lastPublishedVersionId: newPublishedVersionId },
    );
  }

  private async enableTrigger(workflowVersion: WorkflowVersionWorkspaceEntity) {
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
        });

        return;
      }
      case WorkflowTriggerType.CRON: {
        const pattern = computeCronPatternFromSchedule(workflowVersion.trigger);

        await this.automatedTriggerWorkspaceService.addAutomatedTrigger({
          workflowId: workflowVersion.workflowId,
          type: AutomatedTriggerType.CRON,
          settings: { pattern },
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
  ) {
    assertWorkflowVersionTriggerIsDefined(workflowVersion);

    switch (workflowVersion.trigger.type) {
      case WorkflowTriggerType.DATABASE_EVENT:
      case WorkflowTriggerType.CRON:
        await this.automatedTriggerWorkspaceService.deleteAutomatedTrigger({
          workflowId: workflowVersion.workflowId,
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
