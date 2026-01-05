import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class DashboardTimestampService {
  private readonly logger = new Logger(DashboardTimestampService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async updateLinkedDashboardsUpdatedAtByPageLayoutId({
    pageLayoutId,
    workspaceId,
  }: {
    pageLayoutId: string;
    workspaceId: string;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    try {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        authContext,
        async () => {
          const dashboardRepository =
            await this.globalWorkspaceOrmManager.getRepository(
              workspaceId,
              'dashboard',
              { shouldBypassPermissionChecks: true },
            );

          await dashboardRepository.update(
            { pageLayoutId },
            { updatedAt: new Date() },
          );
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to update dashboard updatedAt for page layout ${pageLayoutId}: ${error}`,
      );
    }
  }

  async updateLinkedDashboardsUpdatedAtByTabId({
    tabId,
    workspaceId,
  }: {
    tabId: string;
    workspaceId: string;
  }): Promise<void> {
    const { flatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutTabMaps'],
        },
      );

    const tab = flatPageLayoutTabMaps.byId[tabId];

    if (!isDefined(tab)) {
      return;
    }

    await this.updateLinkedDashboardsUpdatedAtByPageLayoutId({
      pageLayoutId: tab.pageLayoutId,
      workspaceId,
    });
  }

  async updateLinkedDashboardsUpdatedAtByWidgetId({
    widgetId,
    workspaceId,
  }: {
    widgetId: string;
    workspaceId: string;
  }): Promise<void> {
    const { flatPageLayoutWidgetMaps, flatPageLayoutTabMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPageLayoutWidgetMaps', 'flatPageLayoutTabMaps'],
        },
      );

    const widget = flatPageLayoutWidgetMaps.byId[widgetId];

    if (!isDefined(widget)) {
      return;
    }

    const tab = flatPageLayoutTabMaps.byId[widget.pageLayoutTabId];

    if (!isDefined(tab)) {
      return;
    }

    await this.updateLinkedDashboardsUpdatedAtByPageLayoutId({
      pageLayoutId: tab.pageLayoutId,
      workspaceId,
    });
  }
}
