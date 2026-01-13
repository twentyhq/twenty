import { Logger } from '@nestjs/common';

import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { DashboardToPageLayoutSyncService } from 'src/modules/dashboard/services/dashboard-to-page-layout-sync.service';
import { type DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

@WorkspaceQueryHook({
  key: `dashboard.destroyMany`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class DashboardDestroyManyPostQueryHook
  implements WorkspacePostQueryHookInstance
{
  private readonly logger = new Logger(DashboardDestroyManyPostQueryHook.name);

  constructor(
    private readonly dashboardToPageLayoutSyncService: DashboardToPageLayoutSyncService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: DashboardWorkspaceEntity[],
  ): Promise<void> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const destroyedDashboards = payload;

    if (destroyedDashboards.length === 0) {
      return;
    }

    const dashboardIds = destroyedDashboards
      .map((dashboard) => dashboard.id)
      .filter(isDefined);

    try {
      await this.dashboardToPageLayoutSyncService.destroyPageLayoutsForDashboards(
        {
          dashboardIds,
          workspaceId: workspace.id,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to destroy page layouts for dashboards, restoring dashboards: ${error}`,
      );

      await this.dashboardToPageLayoutSyncService.restoreDestroyedDashboardsToSoftDeletedState(
        {
          dashboards: destroyedDashboards,
          workspaceId: workspace.id,
        },
      );

      throw error;
    }
  }
}
