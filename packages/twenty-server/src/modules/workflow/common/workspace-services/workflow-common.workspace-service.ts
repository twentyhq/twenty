import { Injectable } from '@nestjs/common';

import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import {
  WorkflowCommonException,
  WorkflowCommonExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-common.exception';
import { WorkflowEventListenerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-event-listener.workspace-entity';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

@Injectable()
export class WorkflowCommonWorkspaceService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async getWorkflowVersionOrFail(
    workflowVersionId: string,
  ): Promise<WorkflowVersionWorkspaceEntity> {
    if (!workflowVersionId) {
      throw new WorkflowTriggerException(
        'Workflow version ID is required',
        WorkflowTriggerExceptionCode.INVALID_INPUT,
      );
    }

    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
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

  async getObjectMetadataItemWithFieldsMaps(
    objectNameSingular: string,
    workspaceId: string,
  ): Promise<{
    objectMetadataItemWithFieldsMaps: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
  }> {
    const currentCacheVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (currentCacheVersion === undefined) {
      throw new WorkflowCommonException(
        'Failed to read: Metadata cache version not found',
        WorkflowCommonExceptionCode.INVALID_CACHE_VERSION,
      );
    }

    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMaps(
        workspaceId,
        currentCacheVersion,
      );

    if (!objectMetadataMaps) {
      throw new WorkflowCommonException(
        'Failed to read: Object metadata collection not found',
        WorkflowCommonExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

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

  async cleanWorkflowsSubEntities(
    workflowIds: string[],
    workspaceId: string,
  ): Promise<void> {
    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
        'workflowVersion',
      );

    const workflowRunRepository =
      await this.twentyORMManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    const workflowEventListenerRepository =
      await this.twentyORMManager.getRepository<WorkflowEventListenerWorkspaceEntity>(
        'workflowEventListener',
      );

    workflowIds.forEach((workflowId) => {
      workflowEventListenerRepository.softDelete({
        workflowId,
      });

      workflowRunRepository.softDelete({
        workflowId,
      });

      workflowVersionRepository.softDelete({
        workflowId,
      });

      this.deleteServerlessFunctions(
        workflowVersionRepository,
        workflowId,
        workspaceId,
      );
    });
  }

  private async deleteServerlessFunctions(
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>,
    workflowId: string,
    workspaceId: string,
  ) {
    const workflowVersions = await workflowVersionRepository.find({
      where: {
        workflowId,
      },
    });

    workflowVersions.forEach((workflowVersion) => {
      workflowVersion.steps?.forEach(async (step) => {
        if (step.type === WorkflowActionType.CODE) {
          await this.serverlessFunctionService.deleteOneServerlessFunction({
            id: step.settings.input.serverlessFunctionId,
            workspaceId,
            isHardDeletion: false,
          });
        }
      });
    });
  }
}
