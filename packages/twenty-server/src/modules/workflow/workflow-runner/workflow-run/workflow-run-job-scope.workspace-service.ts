import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type QueueJobScope } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type RunWorkflowJobTarget } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-target.type';
import { buildWorkflowJobMaxRate } from 'src/modules/workflow/workflow-runner/utils/build-workflow-job-max-rate.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { buildApplicationQueueJobScope } from 'src/engine/core-modules/application/utils/build-application-queue-job-scope.util';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
export class WorkflowRunJobScopeWorkspaceService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
  ) {}

  async resolveForApplication({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string | null | undefined;
  }): Promise<QueueJobScope> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    return buildApplicationQueueJobScope({
      workspaceId,
      applicationId,
      flatApplicationMaps,
    });
  }

  async getCoreWorkflowJobScopeResolver(
    workspaceId: string,
  ): Promise<(coreWorkflowId: string | null) => RunWorkflowJobTarget> {
    const { flatWorkflowMaps, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
        'flatApplicationMaps',
      ]);

    return (coreWorkflowId) => {
      const flatWorkflow = isDefined(coreWorkflowId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: coreWorkflowId,
            flatEntityMaps: flatWorkflowMaps,
          })
        : undefined;
      const scope = buildApplicationQueueJobScope({
        workspaceId,
        applicationId: flatWorkflow?.applicationId,
        flatApplicationMaps,
      });

      return isDefined(flatWorkflow)
        ? {
            ...scope,
            maxRate: buildWorkflowJobMaxRate({
              coreWorkflowId: flatWorkflow.id,
              maxRate: flatWorkflow.maxRate,
            }),
          }
        : scope;
    };
  }

  async resolveForCoreWorkflow({
    workspaceId,
    coreWorkflowId,
  }: {
    workspaceId: string;
    coreWorkflowId: string | null;
  }): Promise<RunWorkflowJobTarget> {
    const resolveJobScope =
      await this.getCoreWorkflowJobScopeResolver(workspaceId);

    return resolveJobScope(coreWorkflowId);
  }

  async resolveForWorkflowRun({
    workspaceId,
    workflowRunId,
  }: {
    workspaceId: string;
    workflowRunId: string;
  }): Promise<RunWorkflowJobTarget> {
    return this.resolveForCoreWorkflow({
      workspaceId,
      coreWorkflowId:
        await this.workflowRunWorkspaceService.getWorkflowRunCoreWorkflowId({
          workflowRunId,
          workspaceId,
        }),
    });
  }
}
