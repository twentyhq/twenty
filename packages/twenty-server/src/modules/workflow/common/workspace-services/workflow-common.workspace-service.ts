import { Injectable } from '@nestjs/common';

import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import {
  WorkflowCommonException,
  WorkflowCommonExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-common.exception';
import { WorkflowAutomatedTriggerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import {
  WorkflowStatus,
  WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

export type ObjectMetadataInfo = {
  objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps;
  objectMetadataMaps: ObjectMetadataMaps;
};

@Injectable()
export class WorkflowCommonWorkspaceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async getWorkflowVersionOrFail({
    workspaceId,
    workflowVersionId,
  }: {
    workspaceId: string;
    workflowVersionId: string;
  }): Promise<WorkflowVersionWorkspaceEntity> {
    if (!workflowVersionId) {
      throw new WorkflowTriggerException(
        'Workflow version ID is required',
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true }, // settings permissions are checked at resolver-level
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionId,
      },
    });

    return this.getValidWorkflowVersionOrFail(workflowVersion);
  }

  async getValidWorkflowVersionOrFail(
    workflowVersion: WorkflowVersionWorkspaceEntity | null,
  ): Promise<WorkflowVersionWorkspaceEntity> {
    if (!workflowVersion) {
      throw new WorkflowTriggerException(
        'Workflow version not found',
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    // FIXME: For now we will make the trigger optional. Later, we'll have to ensure the trigger is defined when publishing the flow.
    // if (!workflowVersion.trigger) {
    //   throw new WorkflowTriggerException(
    //     'Workflow version does not contains trigger',
    //     WorkflowTriggerExceptionCode.INVALID_WORKFLOW_VERSION,
    //   );
    // }

    return { ...workflowVersion, trigger: workflowVersion.trigger };
  }

  async getObjectMetadataMaps(
    workspaceId: string,
  ): Promise<ObjectMetadataMaps> {
    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMapsOrThrow(
        workspaceId,
      );

    return objectMetadataMaps;
  }

  async getObjectMetadataItemWithFieldsMaps(
    objectNameSingular: string,
    workspaceId: string,
  ): Promise<ObjectMetadataInfo> {
    const objectMetadataMaps = await this.getObjectMetadataMaps(workspaceId);

    const objectMetadataItemWithFieldsMaps =
      getObjectMetadataMapItemByNameSingular(
        objectMetadataMaps,
        objectNameSingular,
      );

    if (!objectMetadataItemWithFieldsMaps) {
      throw new WorkflowCommonException(
        `Failed to read: Object ${objectNameSingular} not found`,
        WorkflowCommonExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    return {
      objectMetadataItemWithFieldsMaps,
      objectMetadataMaps,
    };
  }

  async handleWorkflowSubEntities({
    workflowIds,
    workspaceId,
    operation,
  }: {
    workflowIds: string[];
    workspaceId: string;
    operation: 'restore' | 'delete' | 'destroy';
  }): Promise<void> {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true }, // settings permissions are checked at resolver-level
      );

    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowRunWorkspaceEntity>(
        workspaceId,
        'workflowRun',
        { shouldBypassPermissionChecks: true }, // settings permissions are checked at resolver-level
      );

    const workflowAutomatedTriggerRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowAutomatedTriggerWorkspaceEntity>(
        workspaceId,
        'workflowAutomatedTrigger',
        { shouldBypassPermissionChecks: true }, // settings permissions are checked at resolver-level
      );

    for (const workflowId of workflowIds) {
      switch (operation) {
        case 'delete':
          await workflowAutomatedTriggerRepository.softDelete({
            workflowId,
          });

          await workflowRunRepository.softDelete({
            workflowId,
          });

          await workflowVersionRepository.softDelete({
            workflowId,
          });

          break;
        case 'restore':
          await workflowAutomatedTriggerRepository.restore({
            workflowId,
          });

          await workflowRunRepository.restore({
            workflowId,
          });

          await workflowVersionRepository.restore({
            workflowId,
          });

          break;
      }

      await this.deactivateVersionOnDelete({
        workflowVersionRepository,
        workflowId,
        workspaceId,
        operation,
      });

      await this.handleServerlessFunctionSubEntities({
        workflowVersionRepository,
        workflowId,
        workspaceId,
        operation,
      });
    }
  }

  private async deactivateVersionOnDelete({
    workflowVersionRepository,
    workflowId,
    workspaceId,
    operation,
  }: {
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>;
    workspaceId: string;
    workflowId: string;
    operation: 'restore' | 'delete' | 'destroy';
  }) {
    if (operation !== 'delete') {
      return;
    }

    const workflowRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowWorkspaceEntity>(
        workspaceId,
        'workflow',
        { shouldBypassPermissionChecks: true }, // settings permissions are checked at resolver-level
      );

    const workflow = await workflowRepository.findOne({
      where: { id: workflowId },
      withDeleted: true,
    });

    if (workflow?.statuses?.includes(WorkflowStatus.ACTIVE)) {
      const newStatuses = [
        ...workflow.statuses.filter(
          (status) => status !== WorkflowStatus.ACTIVE,
        ),
        WorkflowStatus.DEACTIVATED,
      ];

      await workflowRepository.update(workflowId, {
        statuses: newStatuses,
      });
    }

    const workflowVersions = await workflowVersionRepository.find({
      where: {
        workflowId,
      },
      withDeleted: true,
    });

    for (const workflowVersion of workflowVersions) {
      if (workflowVersion.status === WorkflowVersionStatus.ACTIVE) {
        await workflowVersionRepository.update(workflowVersion.id, {
          status: WorkflowVersionStatus.DEACTIVATED,
        });
      }
    }
  }

  async handleServerlessFunctionSubEntities({
    workflowVersionRepository,
    workflowId,
    workspaceId,
    operation,
  }: {
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>;
    workflowId: string;
    workspaceId: string;
    operation: 'restore' | 'delete' | 'destroy';
  }) {
    const workflowVersions = await workflowVersionRepository.find({
      where: {
        workflowId,
      },
      withDeleted: true,
    });

    workflowVersions.forEach((workflowVersion) => {
      workflowVersion.steps?.forEach(async (step) => {
        if (step.type === WorkflowActionType.CODE) {
          switch (operation) {
            case 'delete':
              await this.serverlessFunctionService.deleteOneServerlessFunction({
                id: step.settings.input.serverlessFunctionId,
                workspaceId,
                softDelete: true,
              });
              break;
            case 'restore':
              await this.serverlessFunctionService.restoreOneServerlessFunction(
                step.settings.input.serverlessFunctionId,
              );
              break;
            case 'destroy':
              await this.serverlessFunctionService.deleteOneServerlessFunction({
                id: step.settings.input.serverlessFunctionId,
                workspaceId,
                softDelete: false,
              });
              break;
          }
        }
      });
    });
  }
}
