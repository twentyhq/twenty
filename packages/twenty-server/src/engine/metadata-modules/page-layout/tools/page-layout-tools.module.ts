import { Global, Module } from '@nestjs/common';

import { PAGE_LAYOUT_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/page-layout-tool-service.token';
import { PageLayoutTabModule } from 'src/engine/metadata-modules/page-layout-tab/page-layout-tab.module';
import { PageLayoutWidgetModule } from 'src/engine/metadata-modules/page-layout-widget/page-layout-widget.module';
import { PageLayoutModule } from 'src/engine/metadata-modules/page-layout/page-layout.module';

import { PageLayoutToolWorkspaceService } from './services/page-layout-tool.workspace-service';

// Global module to make PAGE_LAYOUT_TOOL_SERVICE_TOKEN available to
// ToolProviderModule without creating a circular dependency.
@Global()
@Module({
  imports: [PageLayoutModule, PageLayoutTabModule, PageLayoutWidgetModule],
  providers: [
    PageLayoutToolWorkspaceService,
    {
      provide: PAGE_LAYOUT_TOOL_SERVICE_TOKEN,
      useExisting: PageLayoutToolWorkspaceService,
    },
  ],
  exports: [PageLayoutToolWorkspaceService, PAGE_LAYOUT_TOOL_SERVICE_TOKEN],
})
export class PageLayoutToolsModule {}
