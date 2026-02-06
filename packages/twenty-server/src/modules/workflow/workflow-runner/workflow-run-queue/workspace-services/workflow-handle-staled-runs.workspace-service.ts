import { Injectable, Logger } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { getStaledRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-staled-runs-find-options.util';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';

@Injectable()
export class WorkflowHandleStaledRunsWorkspaceService {
  private readonly logger = new Logger(
    WorkflowHandleStaledRunsWorkspaceService.name,
  );
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workflowThrottlingWorkspaceService: WorkflowThrottlingWorkspaceService,
  ) {}

  async handleStaledRunsForWorkspace(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRunRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          WorkflowRunWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const staledWorkflowRuns = await workflowRunRepository.find({
        where: getStaledRunsFindOptions(),
      });

      if (staledWorkflowRuns.length <= 0) {
        return;
      }

      await workflowRunRepository.update(
        staledWorkflowRuns.map((workflowRun) => workflowRun.id),
        {
          enqueuedAt: null,
          status: WorkflowRunStatus.NOT_STARTED,
        },
      );

      await this.workflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount(
        workspaceId,
      );
    }, authContext);
  }
}
