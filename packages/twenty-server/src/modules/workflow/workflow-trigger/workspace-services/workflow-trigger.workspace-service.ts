import { msg } from '@lingui/core/macro';
import { Injectable, Logger } from '@nestjs/common';
import {
  type ActorMetadata,
  CommandMenuItemAvailabilityType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { buildCoreDispatchIds } from 'src/engine/core-modules/workflow/utils/build-core-dispatch-ids.util';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { CommandMenuItemService } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.service';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { assertWorkflowVersionTriggerIsDefined } from 'src/modules/workflow/common/utils/assert-workflow-version-trigger-is-defined.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { getPickRecordLoadBalanceConfigError } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-pick-record-load-balance-config-error.util';
import { WorkflowVersionValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation.workspace-service';
import { CodeStepBuildService } from 'src/modules/workflow/workflow-builder/workflow-version-step/code-step/services/code-step-build.service';
import {
  type WorkflowAction,
  type WorkflowPickRecordAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
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
import { getWorkflowCommandMenuItemLabel } from 'src/modules/workflow/workflow-trigger/utils/get-workflow-command-menu-item-label.util';
import { assertNever } from 'src/utils/assert';

@Injectable()
export class WorkflowTriggerWorkspaceService {
  private readonly logger = new Logger(WorkflowTriggerWorkspaceService.name);

  constructor(
    private readonly workflowVersionValidationWorkspaceService: WorkflowVersionValidationWorkspaceService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly codeStepBuildService: CodeStepBuildService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly automatedTriggerWorkspaceService: AutomatedTriggerWorkspaceService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    private readonly commandMenuItemService: CommandMenuItemService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
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

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersionRepository =
        this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      const workflowVersionNullable = await workflowVersionRepository.findOne({
        where: { id: workflowVersionId },
      });

      const workflowVersion =
        await this.workflowCommonWorkspaceService.getValidWorkflowVersionOrFail(
          workflowVersionNullable,
        );

      const workflowRepository =
        this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
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

      await this.workflowVersionValidationWorkspaceService.assertWorkflowVersionIsActivableOrThrow(
        {
          workspaceId,
          trigger: workflowVersion.trigger,
          steps: workflowVersion.steps,
        },
      );

      assertVersionCanBeActivated(workflowVersion, workflow);

      await this.assertPickRecordLoadBalanceConfigIsValid({
        steps: workflowVersion.steps ?? [],
        workspaceId,
      });

      await this.codeStepBuildService.buildCodeStepsFromSourceForSteps({
        workspaceId,
        steps: workflowVersion.steps ?? [],
      });

      await this.codeStepBuildService.switchCodeStepLogicFunctionsToPrebuilt({
        workspaceId,
        steps: workflowVersion.steps ?? [],
      });

      await this.performActivationSteps(workflow, workflowVersion, workspaceId);

      return true;
    }, authContext);
  }

  private async assertPickRecordLoadBalanceConfigIsValid({
    steps,
    workspaceId,
  }: {
    steps: WorkflowAction[];
    workspaceId: string;
  }) {
    const pickRecordSteps = steps.filter(
      (step): step is WorkflowPickRecordAction =>
        step.type === WorkflowActionType.PICK_RECORD,
    );

    if (pickRecordSteps.length === 0) {
      return;
    }

    const { objectIdByNameSingular, flatFieldMetadataMaps } =
      await this.workflowCommonWorkspaceService.getFlatEntityMaps(workspaceId);

    for (const step of pickRecordSteps) {
      const loadBalanceError = getPickRecordLoadBalanceConfigError({
        step,
        objectIdByNameSingular,
        flatFieldMetadataMaps,
      });

      if (isDefined(loadBalanceError)) {
        throw new WorkflowTriggerException(
          loadBalanceError,
          WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
        );
      }
    }
  }

  async deactivateWorkflowVersion(
    workflowVersionId: string,
    workspaceId: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersionRepository =
        this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      await this.performDeactivationSteps(
        workflowVersionId,
        workflowVersionRepository,
        workspaceId,
      );

      return true;
    }, authContext);
  }

  async stopWorkflowRun(workflowRunId: string, workspaceId: string) {
    return this.workflowRunnerWorkspaceService.stopWorkflowRun(
      workspaceId,
      workflowRunId,
    );
  }

  async retryWorkflowRun(workflowRunId: string, workspaceId: string) {
    return this.workflowRunnerWorkspaceService.retryWorkflowRun(
      workspaceId,
      workflowRunId,
    );
  }

  private async mirrorVersionStatusChangeInTransaction(
    workflowVersionId: string,
    workspaceId: string,
    transactionScope: WorkspaceTransactionScope,
  ): Promise<string | null> {
    const workflowVersion = await transactionScope
      .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
        shouldBypassPermissionChecks: true,
      })
      .findOne({ where: { id: workflowVersionId } });

    if (!isDefined(workflowVersion)) {
      return null;
    }

    const mirrorResult =
      await this.workflowVersionCoreSyncService.mirrorWorkflowVersionWrite({
        workspaceId,
        transactionScope,
        workflowVersion,
      });

    return (
      mirrorResult?.coreWorkflowVersionId ??
      workflowVersion.coreWorkflowVersionId ??
      null
    );
  }

  private async performActivationSteps(
    workflow: WorkflowWorkspaceEntity,
    workflowVersion: WorkflowVersionWorkspaceEntity,
    workspaceId: string,
  ) {
    let previousVersion: WorkflowVersionWorkspaceEntity | null = null;

    let mirroredCoreWorkflowVersionIdForCommandMenuItem: string | null = null;

    await this.workspaceOrmManager.runInWorkspaceTransaction(
      async (transactionScope) => {
        await transactionScope.executeRawQuery(
          `SELECT id FROM "${getWorkspaceSchemaName(workspaceId)}".workflow WHERE id = $1 FOR NO KEY UPDATE`,
          [workflow.id],
        );
        await transactionScope.executeRawQuery(
          `SELECT id FROM "${getWorkspaceSchemaName(workspaceId)}"."workflowVersion" WHERE "workflowId" = $1 ORDER BY id FOR NO KEY UPDATE`,
          [workflow.id],
        );

        const unchangedVersion = await transactionScope.executeRawQuery(
          `SELECT id FROM "${getWorkspaceSchemaName(workspaceId)}"."workflowVersion" WHERE id = $1
           AND status = $2 AND trigger IS NOT DISTINCT FROM $3::jsonb AND steps IS NOT DISTINCT FROM $4::jsonb`,
          [
            workflowVersion.id,
            workflowVersion.status,
            JSON.stringify(workflowVersion.trigger),
            JSON.stringify(workflowVersion.steps),
          ],
        );

        if (unchangedVersion.length !== 1) {
          throw new WorkflowTriggerException(
            'Workflow version changed during activation',
            WorkflowTriggerExceptionCode.INVALID_INPUT,
            {
              userFriendlyMessage: msg`Workflow version changed, please reload and retry`,
            },
          );
        }

        const transactionalWorkflowRepository =
          transactionScope.getRepository<WorkflowWorkspaceEntity>('workflow', {
            shouldBypassPermissionChecks: true,
          });
        const transactionalWorkflowVersionRepository =
          transactionScope.getRepository<WorkflowVersionWorkspaceEntity>(
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        const currentWorkflow =
          await transactionalWorkflowRepository.findOneOrFail({
            where: { id: workflow.id },
          });

        if (currentWorkflow.lastPublishedVersionId !== workflowVersion.id) {
          if (currentWorkflow.lastPublishedVersionId) {
            previousVersion =
              await transactionalWorkflowVersionRepository.findOne({
                where: { id: currentWorkflow.lastPublishedVersionId },
              });

            if (previousVersion?.status === WorkflowVersionStatus.ACTIVE) {
              await this.disableAutomatedTrigger(previousVersion, workspaceId, {
                transactionScope,
              });
            }

            await transactionalWorkflowVersionRepository.update(
              { id: currentWorkflow.lastPublishedVersionId },
              { status: WorkflowVersionStatus.ARCHIVED },
            );

            await this.mirrorVersionStatusChangeInTransaction(
              currentWorkflow.lastPublishedVersionId,
              workspaceId,
              transactionScope,
            );
          }

          await transactionalWorkflowRepository.update(
            { id: workflow.id },
            { lastPublishedVersionId: workflowVersion.id },
          );
        }

        const activeWorkflowVersions =
          await transactionalWorkflowVersionRepository.find({
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

        await transactionalWorkflowVersionRepository.update(
          { id: workflowVersion.id },
          { status: WorkflowVersionStatus.ACTIVE },
        );

        const mirroredCoreWorkflowVersionId =
          await this.mirrorVersionStatusChangeInTransaction(
            workflowVersion.id,
            workspaceId,
            transactionScope,
          );

        if (!isDefined(mirroredCoreWorkflowVersionId)) {
          throw new WorkflowTriggerException(
            'Activated workflow version has no core mapping',
            WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
          );
        }

        await transactionScope.executeRawQuery(
          `UPDATE core."workflow" SET "lastPublishedVersionId" = $3, "lastPublishedCoreWorkflowVersionId" = $4, "updatedAt" = now() WHERE "workspaceId" = $1 AND "workspaceWorkflowId" = $2`,
          [
            workspaceId,
            workflow.id,
            workflowVersion.id,
            mirroredCoreWorkflowVersionId,
          ],
        );

        mirroredCoreWorkflowVersionIdForCommandMenuItem =
          mirroredCoreWorkflowVersionId;

        await this.enableAutomatedTrigger(workflowVersion, workspaceId, {
          transactionScope,
          coreWorkflowVersionId: mirroredCoreWorkflowVersionId,
        });
      },
    );

    if (isDefined(previousVersion)) {
      await this.deleteCommandMenuItem(previousVersion, workspaceId);
      await this.emitStatusUpdateEvents(
        previousVersion,
        WorkflowVersionStatus.ARCHIVED,
        workspaceId,
      );
    }

    await this.createOrUpdateCommandMenuItem(
      workflow,
      workflowVersion,
      workspaceId,
      mirroredCoreWorkflowVersionIdForCommandMenuItem,
    );

    await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );

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

    await this.workspaceOrmManager.runInWorkspaceTransaction(
      async (transactionScope) => {
        await transactionScope
          .getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
            shouldBypassPermissionChecks: true,
          })
          .update(
            { id: workflowVersion.id },
            { status: WorkflowVersionStatus.DEACTIVATED },
          );

        await this.mirrorVersionStatusChangeInTransaction(
          workflowVersion.id,
          workspaceId,
          transactionScope,
        );

        await this.disableAutomatedTrigger(workflowVersion, workspaceId, {
          transactionScope,
        });
      },
    );

    await this.deleteCommandMenuItem(workflowVersion, workspaceId);

    await this.workflowVersionCoreSyncService.invalidateAutomatedTriggerMaps(
      workspaceId,
    );

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
    mirroredCoreWorkflowVersionId: string | null,
  ) {
    assertWorkflowVersionTriggerIsDefined(workflowVersion);

    if (workflowVersion.trigger.type !== WorkflowTriggerType.MANUAL) {
      return;
    }

    const trigger = workflowVersion.trigger as WorkflowManualTrigger;

    const { availabilityType, availabilityObjectMetadataId } =
      await this.resolveManualTriggerAvailability(trigger, workspaceId);

    const label = getWorkflowCommandMenuItemLabel(workflow);

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
          coreWorkflowVersionId:
            mirroredCoreWorkflowVersionId ??
            workflowVersion.coreWorkflowVersionId ??
            undefined,
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
      transactionScope: WorkspaceTransactionScope;
      coreWorkflowVersionId?: string | null;
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
          transactionScope: transactionContext?.transactionScope,
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
          transactionScope: transactionContext?.transactionScope,
        });

        const cachedTrigger: CachedCronTrigger = {
          workspaceId,
          workflowId: workflowVersion.workflowId,
          pattern,
          ...buildCoreDispatchIds({
            coreWorkflowVersionId:
              transactionContext?.coreWorkflowVersionId ??
              workflowVersion.coreWorkflowVersionId,
            workspaceWorkflowVersionId: workflowVersion.id,
          }),
        };

        const publishCronCache = async () => {
          try {
            await this.cacheStorageService.hashSetIfExists({
              key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
              field: workflowVersion.workflowId,
              value: JSON.stringify(cachedTrigger),
            });
          } catch (error) {
            this.logger.error(
              `Cron trigger cache entry not published for workflow ${workflowVersion.workflowId}, dropping the cron cache so the next tick rebuilds it from the database`,
              error,
            );

            try {
              await this.cacheStorageService.del(
                WORKFLOW_CRON_TRIGGER_CACHE_KEY,
              );
            } catch (invalidationError) {
              this.logger.error(invalidationError);
            }
          }
        };

        if (isDefined(transactionContext)) {
          transactionContext.transactionScope.afterCommit(publishCronCache);
        } else {
          await publishCronCache();
        }

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
      transactionScope: WorkspaceTransactionScope;
    },
  ) {
    assertWorkflowVersionTriggerIsDefined(workflowVersion);

    switch (workflowVersion.trigger.type) {
      case WorkflowTriggerType.DATABASE_EVENT:
        await this.automatedTriggerWorkspaceService.deleteAutomatedTrigger({
          workflowId: workflowVersion.workflowId,
          workspaceId,
          transactionScope: transactionContext?.transactionScope,
        });

        return;
      case WorkflowTriggerType.CRON:
        await this.automatedTriggerWorkspaceService.deleteAutomatedTrigger({
          workflowId: workflowVersion.workflowId,
          workspaceId,
          transactionScope: transactionContext?.transactionScope,
        });

        const removeCronCache = async () => {
          await this.cacheStorageService.hashDelete({
            key: WORKFLOW_CRON_TRIGGER_CACHE_KEY,
            field: workflowVersion.workflowId,
          });
        };

        if (isDefined(transactionContext)) {
          transactionContext.transactionScope.afterCommit(removeCronCache);
        } else {
          await removeCronCache();
        }

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
