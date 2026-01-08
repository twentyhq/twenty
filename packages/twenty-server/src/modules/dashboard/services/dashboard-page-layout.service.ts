import { Injectable, Logger } from '@nestjs/common';

import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import type { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

@Injectable()
export class DashboardPageLayoutService {
  private readonly logger = new Logger(DashboardPageLayoutService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutTabService: PageLayoutTabService,
  ) {}

  public async createPageLayoutForDashboard({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<string> {
    const pageLayout = await this.pageLayoutService.create(
      {
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        name: 'Dashboard Layout',
      },
      workspaceId,
    );

    await this.pageLayoutTabService.create(
      {
        title: 'Tab 1',
        pageLayoutId: pageLayout.id,
      },
      workspaceId,
    );

    return pageLayout.id;
  }

  public async handlePageLayoutForDashboards({
    dashboardIds,
    workspaceId,
    operation,
  }: {
    dashboardIds: string[];
    workspaceId: string;
    operation: 'delete' | 'restore' | 'destroy';
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const dashboardRepository =
          await this.globalWorkspaceOrmManager.getRepository<DashboardWorkspaceEntity>(
            workspaceId,
            'dashboard',
            { shouldBypassPermissionChecks: true },
          );

        const dashboards = await dashboardRepository.find({
          where: {
            id: In(dashboardIds),
          },
          withDeleted: true,
        });

        for (const dashboard of dashboards) {
          if (!isDefined(dashboard.pageLayoutId)) {
            continue;
          }

          switch (operation) {
            case 'delete':
              await this.pageLayoutService.delete(
                dashboard.pageLayoutId,
                workspaceId,
              );
              break;
            case 'restore':
              await this.pageLayoutService.restore(
                dashboard.pageLayoutId,
                workspaceId,
              );
              break;
            case 'destroy':
              await this.pageLayoutService.destroy(
                dashboard.pageLayoutId,
                workspaceId,
              );
              break;
            default:
              assertUnreachable(operation);
          }
        }
      },
    );
  }
}
