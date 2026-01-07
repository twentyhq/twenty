import type { ApplicationService } from 'src/engine/core-modules/application/application.service';
import type { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import type { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import type { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import type { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import type { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import type { RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type DashboardToolDependencies = {
  pageLayoutService: PageLayoutService;
  pageLayoutTabService: PageLayoutTabService;
  pageLayoutWidgetService: PageLayoutWidgetService;
  globalWorkspaceOrmManager: GlobalWorkspaceOrmManager;
  recordPositionService: RecordPositionService;
  applicationService: ApplicationService;
};

export type DashboardToolContext = {
  workspaceId: string;
};

export type DashboardToolContextWithPermissions = DashboardToolContext & {
  rolePermissionConfig: RolePermissionConfig;
};
