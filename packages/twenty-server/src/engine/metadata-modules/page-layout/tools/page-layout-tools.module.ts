import { Module } from '@nestjs/common';

import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { PlaceFrontComponentTool } from 'src/engine/metadata-modules/page-layout/tools/place-front-component.tool';
import { ListRecordPageLayoutsTool } from 'src/engine/metadata-modules/page-layout/tools/list-record-page-layouts.tool';
import { DeletePageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/delete-page-layout-widget.tool';
import { UpdatePageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/update-page-layout-widget.tool';
import { AddPageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/add-page-layout-widget.tool';
import { AddPageLayoutTabTool } from 'src/engine/metadata-modules/page-layout/tools/add-page-layout-tab.tool';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { PageLayoutTabModule } from 'src/engine/metadata-modules/page-layout-tab/page-layout-tab.module';
import { PageLayoutWidgetModule } from 'src/engine/metadata-modules/page-layout-widget/page-layout-widget.module';
import { PageLayoutModule } from 'src/engine/metadata-modules/page-layout/page-layout.module';
import { PageLayoutToolService } from './services/page-layout-tool.service';

@Module({
  imports: [
    WorkspaceCacheModule,
    PageLayoutModule,
    PageLayoutTabModule,
    PageLayoutWidgetModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    PlaceFrontComponentTool,
    ListRecordPageLayoutsTool,
    DeletePageLayoutWidgetTool,
    UpdatePageLayoutWidgetTool,
    AddPageLayoutWidgetTool,
    AddPageLayoutTabTool,
    PageLayoutToolService,
  ],
  exports: [PageLayoutToolService],
})
export class PageLayoutToolsModule {}
