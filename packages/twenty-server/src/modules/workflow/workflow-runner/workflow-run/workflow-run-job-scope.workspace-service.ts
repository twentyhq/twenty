import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type RunWorkflowJobTarget } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-target.type';
import { buildWorkflowJobLimiter } from 'src/modules/workflow/workflow-runner/utils/build-workflow-job-limiter.util';
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

      if (!isDefined(flatWorkflow)) {
        return scope;
      }

      return {
        ...scope,
        limiter: buildWorkflowJobLimiter({
          coreWorkflowId: flatWorkflow.id,
          limiter: flatWorkflow.jobConfig?.limiter,
        }),
      };
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
