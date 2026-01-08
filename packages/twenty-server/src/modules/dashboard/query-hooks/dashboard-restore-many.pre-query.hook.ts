import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type RestoreManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { DashboardPageLayoutService } from 'src/modules/dashboard/services/dashboard-page-layout.service';

@WorkspaceQueryHook(`dashboard.restoreMany`)
export class DashboardRestoreManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly dashboardPageLayoutService: DashboardPageLayoutService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: RestoreManyResolverArgs<{ id: { in: string[] } }>,
  ): Promise<RestoreManyResolverArgs<{ id: { in: string[] } }>> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.dashboardPageLayoutService.handlePageLayoutForDashboards({
      dashboardIds: payload.filter.id.in,
      workspaceId: workspace.id,
      operation: 'restore',
    });

    return payload;
  }
}
