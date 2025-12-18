import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { createAddDashboardWidgetTool } from 'src/modules/dashboard/tools/add-dashboard-widget.tool';
import { createCreateCompleteDashboardTool } from 'src/modules/dashboard/tools/create-complete-dashboard.tool';
import { createDeleteDashboardWidgetTool } from 'src/modules/dashboard/tools/delete-dashboard-widget.tool';
import { createGetDashboardTool } from 'src/modules/dashboard/tools/get-dashboard.tool';
import { createListDashboardsTool } from 'src/modules/dashboard/tools/list-dashboards.tool';
import { type DashboardToolDependencies } from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';
import { createUpdateDashboardWidgetTool } from 'src/modules/dashboard/tools/update-dashboard-widget.tool';

@Injectable()
export class DashboardToolWorkspaceService {
  private readonly deps: DashboardToolDependencies;

  constructor(
    pageLayoutService: PageLayoutService,
    pageLayoutTabService: PageLayoutTabService,
    pageLayoutWidgetService: PageLayoutWidgetService,
    globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    recordPositionService: RecordPositionService,
    applicationService: ApplicationService,
  ) {
    this.deps = {
      pageLayoutService,
      pageLayoutTabService,
      pageLayoutWidgetService,
      globalWorkspaceOrmManager,
      recordPositionService,
      applicationService,
    };
  }

  generateDashboardTools(
    workspaceId: string,
    _rolePermissionConfig: RolePermissionConfig,
  ): ToolSet {
    const context = { workspaceId };

    const createCompleteDashboard = createCreateCompleteDashboardTool(
      this.deps,
      context,
    );
    const listDashboards = createListDashboardsTool(this.deps, context);
    const getDashboard = createGetDashboardTool(this.deps, context);
    const addDashboardWidget = createAddDashboardWidgetTool(this.deps, context);
    const updateDashboardWidget = createUpdateDashboardWidgetTool(
      this.deps,
      context,
    );
    const deleteDashboardWidget = createDeleteDashboardWidgetTool(
      this.deps,
      context,
    );

    return {
      [createCompleteDashboard.name]: createCompleteDashboard,
      [listDashboards.name]: listDashboards,
      [getDashboard.name]: getDashboard,
      [addDashboardWidget.name]: addDashboardWidget,
      [updateDashboardWidget.name]: updateDashboardWidget,
      [deleteDashboardWidget.name]: deleteDashboardWidget,
    };
  }
}
