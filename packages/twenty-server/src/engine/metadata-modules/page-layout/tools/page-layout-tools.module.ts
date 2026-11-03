import { Global, Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { RecordPositionModule } from 'src/engine/core-modules/record-position/record-position.module';
import { PAGE_LAYOUT_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/page-layout-tool-service.token';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PageLayoutTabModule } from 'src/engine/metadata-modules/page-layout-tab/page-layout-tab.module';
import { PageLayoutWidgetModule } from 'src/engine/metadata-modules/page-layout-widget/page-layout-widget.module';
import { PageLayoutModule } from 'src/engine/metadata-modules/page-layout/page-layout.module';

import { PageLayoutToolService } from './services/page-layout-tool.service';

@Global()
@Module({
  imports: [
    PageLayoutModule,
    PageLayoutTabModule,
    PageLayoutWidgetModule,
    RecordPositionModule,
    ApplicationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    PageLayoutToolService,
    {
      provide: PAGE_LAYOUT_TOOL_SERVICE_TOKEN,
      useExisting: PageLayoutToolService,
    },
  ],
  exports: [PageLayoutToolService, PAGE_LAYOUT_TOOL_SERVICE_TOKEN],
})
export class PageLayoutToolsModule {}
