import { Injectable } from '@nestjs/common';
import { type ToolSet } from 'ai';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ApplicationCallerOperation } from 'src/engine/core-modules/application/types/application-caller-operation.type';
import { type PageLayoutToolDependencies } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import { PageLayoutToolService } from 'src/engine/metadata-modules/page-layout/tools/services/page-layout-tool.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { createCreateCompleteDashboardTool } from 'src/modules/dashboard/tools/create-complete-dashboard.tool';
import { createListDashboardsTool } from 'src/modules/dashboard/tools/list-dashboards.tool';
import { createGetDashboardTool } from 'src/modules/dashboard/tools/get-dashboard.tool';

@Injectable()
export class DashboardToolWorkspaceService {
  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutTabService: PageLayoutTabService,
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
    private readonly applicationService: ApplicationService,
    private readonly pageLayoutToolService: PageLayoutToolService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  generateDashboardTools({
    workspaceId,
    authContext,
    callingApplication,
  }: {
    workspaceId: string;
    authContext: WorkspaceAuthContext;
    callingApplication: ApplicationCallerOperation['callingApplication'];
  }): ToolSet {
    const dependencies: PageLayoutToolDependencies = {
      pageLayoutService: this.pageLayoutService,
      pageLayoutTabService: this.pageLayoutTabService,
      pageLayoutWidgetService: this.pageLayoutWidgetService,
      workspaceOrmManager: this.workspaceOrmManager,
      recordPositionService: this.recordPositionService,
      applicationService: this.applicationService,
      flatEntityMapsCacheService: this.flatEntityMapsCacheService,
      pageLayoutToolService: this.pageLayoutToolService,
    };
    const context = {
      workspaceId,
      callingApplication,
      workspaceCustomApplicationId:
        authContext.workspace.workspaceCustomApplicationId ?? undefined,
    };
    const contextWithPermissions = { ...context, authContext };

    const createCompleteDashboard = createCreateCompleteDashboardTool(
      dependencies,
      contextWithPermissions,
    );
    const listDashboards = createListDashboardsTool({
      dependencies,
      context: contextWithPermissions,
    });
    const getDashboard = createGetDashboardTool(
      dependencies,
      contextWithPermissions,
    );
    return {
      [createCompleteDashboard.name]: createCompleteDashboard,
      [listDashboards.name]: listDashboards,
      [getDashboard.name]: getDashboard,
    };
  }
}
