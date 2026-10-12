import { WorkflowStatus } from 'src/engine/core-modules/workflow/enums/workflow-status.enum';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { Injectable } from '@nestjs/common';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  type ObjectMetadataInfo,
  WorkflowMetadataReadService,
} from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { type WorkflowAutomatedTriggerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

export type { ObjectMetadataInfo };

@Injectable()
export class WorkflowCommonWorkspaceService {
  constructor(
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowMetadataReadService: WorkflowMetadataReadService,
  ) {}

  async getFlatEntityMaps(workspaceId: string): Promise<{
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    objectIdByNameSingular: Record<string, string>;
  }> {
    return this.workflowMetadataReadService.getFlatEntityMaps(workspaceId);
  }

  async getLogicFunctionById({
    logicFunctionId,
    workspaceId,
  }: {
    logicFunctionId: string;
    workspaceId: string;
  }): Promise<FlatLogicFunction | undefined> {
    return this.workflowMetadataReadService.getLogicFunctionById({
      logicFunctionId,
      workspaceId,
    });
  }

  async getObjectMetadataInfo(
    objectNameSingular: string,
    workspaceId: string,
  ): Promise<ObjectMetadataInfo> {
    return this.workflowMetadataReadService.getObjectMetadataInfo(
      objectNameSingular,
      workspaceId,
    );
  }

  async deleteWorkflowSubEntities({
    workflowIds,
    workspaceId,
  }: {
    workflowIds: string[];
    workspaceId: string;
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowVersionRepository =
        this.workspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      const workflowAutomatedTriggerRepository =
        this.workspaceOrmManager.getRepository<WorkflowAutomatedTriggerWorkspaceEntity>(
          'workflowAutomatedTrigger',
          { shouldBypassPermissionChecks: true },
        );

      for (const workflowId of workflowIds) {
        await workflowAutomatedTriggerRepository.softDelete({ workflowId });
        await workflowVersionRepository.softDelete({ workflowId });

        await this.deactivateVersionOnDelete({
          workflowVersionRepository,
          workflowId,
        });

        await this.workflowCoreSyncService.reconcileWorkspaceWorkflows(
          workspaceId,
          [workflowId],
        );
      }
    }, buildSystemAuthContext(workspaceId));
  }

  private async deactivateVersionOnDelete({
    workflowVersionRepository,
    workflowId,
  }: {
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>;
    workflowId: string;
  }) {
    const workflowVersions = await workflowVersionRepository.find({
      where: { workflowId },
      withDeleted: true,
    });

    await this.workspaceOrmManager.runInWorkspaceTransaction(
      async ({ getRepository }) => {
        const workflowRepository = getRepository<WorkflowWorkspaceEntity>(
          'workflow',
          { shouldBypassPermissionChecks: true },
        );
        const transactionalWorkflowVersionRepository =
          getRepository<WorkflowVersionWorkspaceEntity>('workflowVersion', {
            shouldBypassPermissionChecks: true,
          });

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

        for (const workflowVersion of workflowVersions) {
          if (workflowVersion.status === WorkflowVersionStatus.ACTIVE) {
            await transactionalWorkflowVersionRepository.update(
              workflowVersion.id,
              { status: WorkflowVersionStatus.DEACTIVATED },
            );
          }
        }
      },
    );
  }
}
