import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { createAddPageLayoutTabTool } from 'src/engine/metadata-modules/page-layout/tools/add-page-layout-tab.tool';
import { createAddPageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/add-page-layout-widget.tool';
import { createCreateCompleteDashboardTool } from 'src/modules/dashboard/tools/create-complete-dashboard.tool';
import { createDeletePageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/delete-page-layout-widget.tool';
import { createGetDashboardTool } from 'src/modules/dashboard/tools/get-dashboard.tool';
import { createListDashboardsTool } from 'src/modules/dashboard/tools/list-dashboards.tool';
import { createListRecordPageLayoutsTool } from 'src/engine/metadata-modules/page-layout/tools/list-record-page-layouts.tool';
import { createPlaceFrontComponentTool } from 'src/engine/metadata-modules/page-layout/tools/place-front-component.tool';
import { type PageLayoutToolDependencies } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';
import { createUpdatePageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/update-page-layout-widget.tool';

@Injectable()
export class PageLayoutToolService {
  private readonly deps: PageLayoutToolDependencies;

  constructor(
    pageLayoutService: PageLayoutService,
    pageLayoutTabService: PageLayoutTabService,
    pageLayoutWidgetService: PageLayoutWidgetService,
    workspaceOrmManager: WorkspaceOrmManager,
    recordPositionService: RecordPositionService,
    applicationService: ApplicationService,
    flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    this.deps = {
      pageLayoutService,
      pageLayoutTabService,
      pageLayoutWidgetService,
      workspaceOrmManager,
      recordPositionService,
      applicationService,
      flatEntityMapsCacheService,
    };
  }

  generatePageLayoutTools(
    workspaceId: string,
    authContext: WorkspaceAuthContext,
  ): ToolSet {
    const context = { workspaceId };
    const contextWithPermissions = { workspaceId, authContext };

    const createCompleteDashboard = createCreateCompleteDashboardTool(
      this.deps,
      contextWithPermissions,
    );
    const listDashboards = createListDashboardsTool(
      this.deps,
      contextWithPermissions,
    );
    const getDashboard = createGetDashboardTool(
      this.deps,
      contextWithPermissions,
    );
    const addPageLayoutTab = createAddPageLayoutTabTool(this.deps, context);
    const addPageLayoutWidget = createAddPageLayoutWidgetTool(
      this.deps,
      context,
    );
    const updatePageLayoutWidget = createUpdatePageLayoutWidgetTool(
      this.deps,
      context,
    );
    const deletePageLayoutWidget = createDeletePageLayoutWidgetTool(
      this.deps,
      context,
    );

    const placeFrontComponent = createPlaceFrontComponentTool(
      this.deps,
      context,
    );
    const listRecordPageLayouts = createListRecordPageLayoutsTool(
      this.deps,
      context,
    );

    return {
      [placeFrontComponent.name]: placeFrontComponent,
      [listRecordPageLayouts.name]: listRecordPageLayouts,
      [createCompleteDashboard.name]: createCompleteDashboard,
      [listDashboards.name]: listDashboards,
      [getDashboard.name]: getDashboard,
      [addPageLayoutTab.name]: addPageLayoutTab,
      [addPageLayoutWidget.name]: addPageLayoutWidget,
      [updatePageLayoutWidget.name]: updatePageLayoutWidget,
      [deletePageLayoutWidget.name]: deletePageLayoutWidget,
    };
  }
}
