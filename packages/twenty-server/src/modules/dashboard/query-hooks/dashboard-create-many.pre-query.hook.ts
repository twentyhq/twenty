import { Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { DashboardToPageLayoutSyncService } from 'src/modules/dashboard/services/dashboard-to-page-layout-sync.service';
import { type DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

@Injectable()
@WorkspaceQueryHook(`dashboard.createMany`)
export class DashboardCreateManyPreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly dashboardToPageLayoutSyncService: DashboardToPageLayoutSyncService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: CreateManyResolverArgs<DashboardWorkspaceEntity>,
  ): Promise<CreateManyResolverArgs<DashboardWorkspaceEntity>> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    for (const data of payload.data) {
      if (isDefined(data.pageLayoutId)) {
        continue;
      }

      const pageLayoutId =
        await this.dashboardToPageLayoutSyncService.createPageLayoutForDashboard(
          {
            workspaceId: workspace.id,
          },
        );

      data.pageLayoutId = pageLayoutId;
    }

    return payload;
  }
}
