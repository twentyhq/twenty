import { Global, Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { DASHBOARD_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/dashboard-tool-service.token';
import { PageLayoutTabModule } from 'src/engine/metadata-modules/page-layout-tab/page-layout-tab.module';
import { PageLayoutWidgetModule } from 'src/engine/metadata-modules/page-layout-widget/page-layout-widget.module';
import { PageLayoutModule } from 'src/engine/metadata-modules/page-layout/page-layout.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

import { DashboardToolWorkspaceService } from './services/dashboard-tool.workspace-service';

@Global()
@Module({
  imports: [
    PageLayoutModule,
    PageLayoutTabModule,
    PageLayoutWidgetModule,
    RecordPositionModule,
    TwentyORMModule,
    ApplicationModule,
  ],
  providers: [
    DashboardToolWorkspaceService,
    {
      provide: DASHBOARD_TOOL_SERVICE_TOKEN,
      useExisting: DashboardToolWorkspaceService,
    },
  ],
  exports: [DashboardToolWorkspaceService, DASHBOARD_TOOL_SERVICE_TOKEN],
})
export class DashboardToolsModule {}
