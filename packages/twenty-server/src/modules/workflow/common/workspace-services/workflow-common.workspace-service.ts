import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowCommonException,
  WorkflowCommonExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-common.exception';
import { type WorkflowAutomatedTriggerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowStatus,
  type WorkflowWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';

export type ObjectMetadataInfo = {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
};

@Injectable()
export class WorkflowCommonWorkspaceService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
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

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
            workspaceId,
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        const workflowVersion = await workflowVersionRepository.findOne({
          where: {
            id: workflowVersionId,
          },
        });

        return this.getValidWorkflowVersionOrFail(workflowVersion);
      },
    );
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

    return { ...workflowVersion, trigger: workflowVersion.trigger };
  }

  async getFlatEntityMaps(workspaceId: string): Promise<{
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    objectIdByNameSingular: Record<string, string>;
  }> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    return {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular: idByNameSingular,
    };
  }

  async getObjectMetadataInfo(
    objectNameSingular: string,
    workspaceId: string,
  ): Promise<ObjectMetadataInfo> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    } = await this.getFlatEntityMaps(workspaceId);

    const objectId = objectIdByNameSingular[objectNameSingular];

    if (!isDefined(objectId)) {
      throw new WorkflowCommonException(
        `Failed to read: Object ${objectNameSingular} not found`,
        WorkflowCommonExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const flatObjectMetadata = flatObjectMetadataMaps.byId[objectId];

    if (!isDefined(flatObjectMetadata)) {
      throw new WorkflowCommonException(
        `Failed to read: Object ${objectNameSingular} not found`,
        WorkflowCommonExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    return {
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
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
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
            workspaceId,
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        const workflowRunRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
            workspaceId,
            'workflowRun',
            { shouldBypassPermissionChecks: true },
          );

        const workflowAutomatedTriggerRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
            workspaceId,
            'workflowAutomatedTrigger',
            { shouldBypassPermissionChecks: true },
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
      },
    );
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
      await this.globalWorkspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
        workspaceId,
        'workflow',
        { shouldBypassPermissionChecks: true },
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
