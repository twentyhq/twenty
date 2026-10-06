import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { PageLayoutType } from 'twenty-shared/types';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import type { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

@Injectable()
export class DashboardToPageLayoutSyncService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly i18nService: I18nService,
  ) {}

  public async createPageLayoutForDashboard({
    workspaceId,
    locale,
  }: {
    workspaceId: string;
    locale: keyof typeof APP_LOCALES;
  }): Promise<string> {
    const pageLayout = await this.pageLayoutService.create({
      createPageLayoutInput: {
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        name: 'Dashboard Layout',
      },
      workspaceId,
    });

    await this.pageLayoutTabService.create({
      createPageLayoutTabInput: {
        title: this.i18nService.getI18nInstance(locale)._(msg`Tab 1`),
        pageLayoutId: pageLayout.id,
      },
      workspaceId,
    });

    return pageLayout.id;
  }

  public async destroyPageLayoutsForDashboards({
    dashboardIds,
    workspaceId,
  }: {
    dashboardIds: string[];
    workspaceId: string;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const dashboardRepository =
        this.workspaceOrmManager.getRepository<DashboardWorkspaceEntity>(
          'dashboard',
          { shouldBypassPermissionChecks: true },
        );

      const dashboards = await dashboardRepository.find({
        where: {
          id: In(dashboardIds),
        },
        withDeleted: true,
      });

      const pageLayoutIds = dashboards
        .map((dashboard) => dashboard.pageLayoutId)
        .filter(isDefined);

      await this.pageLayoutService.destroyMany({
        ids: pageLayoutIds,
        workspaceId,
      });
    }, authContext);
  }
}
