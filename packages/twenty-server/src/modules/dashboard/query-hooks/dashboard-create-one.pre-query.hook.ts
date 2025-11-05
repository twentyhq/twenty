import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { PageLayoutType } from 'src/engine/core-modules/page-layout/enums/page-layout-type.enum';
import { PageLayoutTabService } from 'src/engine/core-modules/page-layout/services/page-layout-tab.service';
import { PageLayoutService } from 'src/engine/core-modules/page-layout/services/page-layout.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { type DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

@Injectable()
@WorkspaceQueryHook(`dashboard.createOne`)
export class DashboardCreateOnePreQueryHook
  implements WorkspacePreQueryHookInstance
{
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutTabService: PageLayoutTabService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: CreateOneResolverArgs<DashboardWorkspaceEntity>,
  ): Promise<CreateOneResolverArgs<DashboardWorkspaceEntity>> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    return await this.coreDataSource.transaction(async (manager) => {
      const pageLayout = await this.pageLayoutService.create(
        {
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: null,
          name: 'Dashboard Layout',
        },
        workspace.id,
        manager,
      );

      await this.pageLayoutTabService.create(
        {
          title: 'Tab 1',
          pageLayoutId: pageLayout.id,
        },
        workspace.id,
        manager,
      );

      payload.data.pageLayoutId = pageLayout.id;

      return payload;
    });
  }
}
