import { Injectable, Logger } from '@nestjs/common';
import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ActorMetadata } from 'twenty-shared/types';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { CommandMenuItemService } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.service';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { assertWorkflowVersionTriggerIsDefined } from 'src/modules/workflow/common/utils/assert-workflow-version-trigger-is-defined.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { WORKFLOW_VERSION_STATUS_UPDATED } from 'src/modules/workflow/workflow-status/constants/workflow-version-status-updated.constants';
import { type WorkflowVersionStatusUpdate } from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';
import { AutomatedTriggerWorkspaceService } from 'src/modules/workflow/workflow-trigger/automated-trigger/automated-trigger.workspace-service';
import { type DatabaseEventTriggerSettings } from 'src/modules/workflow/workflow-trigger/automated-trigger/constants/automated-trigger-settings';
import { WORKFLOW_CRON_TRIGGER_CACHE_KEY } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/constants/workflow-cron-trigger-cache-key.constant';
import { type CachedCronTrigger } from 'src/modules/workflow/workflow-trigger/automated-trigger/crons/types/cached-cron-trigger.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import {
  type WorkflowManualTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { assertVersionCanBeActivated } from 'src/modules/workflow/workflow-trigger/utils/assert-version-can-be-activated.util';
import { computeCronPatternFromSchedule } from 'src/modules/workflow/workflow-trigger/utils/compute-cron-pattern-from-schedule';
import { assertNever } from 'src/utils/assert';

@Injectable()
export class WorkflowTriggerWorkspaceService {
  private readonly logger = new Logger(WorkflowTriggerWorkspaceService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly codeStepBuildService: CodeStepBuildService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly automatedTriggerWorkspaceService: AutomatedTriggerWorkspaceService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly commandMenuItemService: CommandMenuItemService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async runWorkflowVersion({
    workflowVersionId,
    payload,
    createdBy,
    workflowRunId,
    workspaceId,
  }: {
    workflowVersionId: string;
    payload: object;
    createdBy: ActorMetadata;
    workflowRunId?: string;
    workspaceId: string;
  }) {
    await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
      workflowVersionId,
      workspaceId,
    });

    return this.workflowRunnerWorkspaceService.run({
      workspaceId,
      workflowRunId,
      workflowVersionId,
      payload,
      source: createdBy,
    });
  }

  async activateWorkflowVersion(
    workflowVersionId: string,
    workspaceId: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
            workspaceId,
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        const workflowVersionNullable = await workflowVersionRepository.findOne(
          {
            where: { id: workflowVersionId },
          },
        );

        const workflowVersion =
          await this.workflowCommonWorkspaceService.getValidWorkflowVersionOrFail(
            workflowVersionNullable,
          );

        const workflowRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
            workspaceId,
            'workflow',
            { shouldBypassPermissionChecks: true },
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

        await this.codeStepBuildService.buildCodeStepsFromSourceForSteps({
          workspaceId,
          steps: workflowVersion.steps ?? [],
        });

        await this.performActivationSteps(
          workflow,
          workflowVersion,
          workflowRepository,
          workflowVersionRepository,
          workspaceId,
        );

        return true;
      },
      authContext,
    );
  }

  async deactivateWorkflowVersion(
    workflowVersionId: string,
    workspaceId: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
            workspaceId,
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        await this.performDeactivationSteps(
          workflowVersionId,
          workflowVersionRepository,
          workspaceId,
        );

        return true;
      },
      authContext,
    );
  }

  async stopWorkflowRun(workflowRunId: string, workspaceId: string) {
    return this.workflowRunnerWorkspaceService.stopWorkflowRun(
      workspaceId,
      workflowRunId,
    );
  }

  private async performActivationSteps(
    workflow: WorkflowWorkspaceEntity,
    workflowVersion: WorkflowVersionWorkspaceEntity,
    workflowRepository: WorkspaceRepository<WorkflowWorkspaceEntity>,
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>,
    workspaceId: string,
  ) {
    const previousPublishedVersionId = workflow.lastPublishedVersionId;

    if (
      previousPublishedVersionId &&
      workflowVersion.id !== previousPublishedVersionId
    ) {
      await this.performDeactivationSteps(
        previousPublishedVersionId,
        workflowVersionRepository,
        workspaceId,
      );
    }

    await this.createOrUpdateCommandMenuItem(
      workflow,
      workflowVersion,
      workspaceId,
    );

    const workspaceDataSource =
      await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

    const queryRunner = workspaceDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (workflow.lastPublishedVersionId !== workflowVersion.id) {
        if (workflow.lastPublishedVersionId) {
          await workflowVersionRepository.update(
            { id: workflow.lastPublishedVersionId },
            { status: WorkflowVersionStatus.ARCHIVED },
            queryRunner.manager,
          );
        }

        await workflowRepository.update(
          { id: workflow.id },
          { lastPublishedVersionId: workflowVersion.id },
          queryRunner.manager,
        );
      }

      const activeWorkflowVersions = await workflowVersionRepository.find(
        {
          where: {
            workflowId: workflowVersion.workflowId,
            status: WorkflowVersionStatus.ACTIVE,
          },
        },
        queryRunner.manager,
      );

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
        queryRunner.manager,
      );

      await this.enableAutomatedTrigger(workflowVersion, workspaceId, {
        entityManager: queryRunner.manager,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.emitStatusUpdateEvents(
      workflowVersion,
      WorkflowVersionStatus.ACTIVE,
      workspaceId,
    );
  }

  private async performDeactivationSteps(
    workflowVersionId: string,
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>,
    workspaceId: string,
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

    await this.deleteCommandMenuItem(workflowVersion, workspaceId);

    const workspaceDataSource =
      await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

    const queryRunner = workspaceDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await workflowVersionRepository.update(
        { id: workflowVersion.id },
        { status: WorkflowVersionStatus.DEACTIVATED },
        queryRunner.manager,
      );

      await this.disableAutomatedTrigger(workflowVersion, workspaceId, {
        entityManager: queryRunner.manager,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.emitStatusUpdateEvents(
      workflowVersion,
      WorkflowVersionStatus.DEACTIVATED,
      workspaceId,
    );
  }

  private async resolveManualTriggerAvailability(
    trigger: WorkflowManualTrigger,
    workspaceId: string,
  ): Promise<{
    availabilityType: CommandMenuItemAvailabilityType;
    availabilityObjectMetadataId: string | undefined;
  }> {
    const availability = trigger.settings.availability;

    let availabilityType = CommandMenuItemAvailabilityType.GLOBAL;
    let availabilityObjectMetadataId: string | undefined;

    if (availability) {
      switch (availability.type) {
        case 'GLOBAL':
          availabilityType = CommandMenuItemAvailabilityType.GLOBAL;
          break;
        case 'SINGLE_RECORD':
        case 'BULK_RECORDS': {
          availabilityType = CommandMenuItemAvailabilityType.RECORD_SELECTION;

          const { objectIdByNameSingular } =
            await this.workflowCommonWorkspaceService.getFlatEntityMaps(
              workspaceId,
            );

          const objectId =
            objectIdByNameSingular[availability.objectNameSingular];

          if (!objectId) {
            throw new WorkflowTriggerException(
              `Object metadata not found for object: ${availability.objectNameSingular}`,
              WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
            );
          }

          availabilityObjectMetadataId = objectId;
          break;
        }
      }
    }

    return { availabilityType, availabilityObjectMetadataId };
  }

  private async createOrUpdateCommandMenuItem(
    workflow: WorkflowWorkspaceEntity,
    workflowVersion: WorkflowVersionWorkspaceEntity,
    workspaceId: string,
  ) {
    assertWorkflowVersionTriggerIsDefined(workflowVersion);

    if (workflowVersion.trigger.type !== WorkflowTriggerType.MANUAL) {
      return;
    }

    const trigger = workflowVersion.trigger as WorkflowManualTrigger;

    const { availabilityType, availabilityObjectMetadataId } =
      await this.resolveManualTriggerAvailability(trigger, workspaceId);

    const label = isNonEmptyString(workflow.name)
      ? workflow.name
      : 'Manual Trigger';

    const existingCommandMenuItem =
      await this.commandMenuItemService.findByWorkflowVersionId(
        workflowVersion.id,
        workspaceId,
      );

    if (existingCommandMenuItem) {
      await this.commandMenuItemService.update(
        {
          id: existingCommandMenuItem.id,
          label,
          shortLabel: label,
          icon: trigger.settings.icon,
          isPinned: trigger.settings.isPinned,
          availabilityType,
          availabilityObjectMetadataId,
        },
        workspaceId,
      );
    } else {
      await this.commandMenuItemService.create(
        {
          workflowVersionId: workflowVersion.id,
          engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
          label,
          shortLabel: label,
          icon: trigger.settings.icon,
          isPinned: trigger.settings.isPinned,
          availabilityType,
          availabilityObjectMetadataId,
        },
        workspaceId,
      );
    }
  }

  private async deleteCommandMenuItem(
    workflowVersion: WorkflowVersionWorkspaceEntity,
    workspaceId: string,
  ) {
    assertWorkflowVersionTriggerIsDefined(workflowVersion);

    if (workflowVersion.trigger.type !== WorkflowTriggerType.MANUAL) {
      return;
    }

    const existingCommandMenuItem =
      await this.commandMenuItemService.findByWorkflowVersionId(
        workflowVersion.id,
        workspaceId,
      );

    if (existingCommandMenuItem) {
      await this.commandMenuItemService.delete(
        existingCommandMenuItem.id,
        workspaceId,
      );
    }
  }

  private async enableAutomatedTrigger(
    workflowVersion: WorkflowVersionWorkspaceEntity,
    workspaceId: string,
    transactionContext?: {
      entityManager: WorkspaceEntityManager;
    },
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
          workspaceId,
          entityManager: transactionContext?.entityManager,
        });

        return;
      }
      case WorkflowTriggerType.CRON: {
        const pattern = computeCronPatternFromSchedule(workflowVersion.trigger);

        await this.automatedTriggerWorkspaceService.addAutomatedTrigger({
          workflowId: workflowVersion.workflowId,
          type: AutomatedTriggerType.CRON,
          settings: { pattern },
          workspaceId,
          entityManager: transactionContext?.entityManager,
        });

        const cachedTrigger: CachedCronTrigger = {
          workspaceId,
          workflowId: workflowVersion.workflowId,
          pattern,
        };

        await this.cacheStorageService.hashSetIfExists({
          key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
          field: workflowVersion.workflowId,
          value: JSON.stringify(cachedTrigger),
        });

        return;
      }
      default:
        assertNever(workflowVersion.trigger);
    }
  }

  private async disableAutomatedTrigger(
    workflowVersion: WorkflowVersionWorkspaceEntity,
    workspaceId: string,
    transactionContext?: {
      entityManager: WorkspaceEntityManager;
    },
  ) {
    assertWorkflowVersionTriggerIsDefined(workflowVersion);

    switch (workflowVersion.trigger.type) {
      case WorkflowTriggerType.DATABASE_EVENT:
        await this.automatedTriggerWorkspaceService.deleteAutomatedTrigger({
          workflowId: workflowVersion.workflowId,
          workspaceId,
          entityManager: transactionContext?.entityManager,
        });

        return;
      case WorkflowTriggerType.CRON:
        await this.automatedTriggerWorkspaceService.deleteAutomatedTrigger({
          workflowId: workflowVersion.workflowId,
          workspaceId,
          entityManager: transactionContext?.entityManager,
        });

        await this.cacheStorageService.hashDelete({
          key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
          field: workflowVersion.workflowId,
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
