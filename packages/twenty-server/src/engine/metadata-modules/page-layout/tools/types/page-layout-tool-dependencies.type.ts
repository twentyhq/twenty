import type { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import type { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import type { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';

export type PageLayoutToolDependencies = {
  pageLayoutService: PageLayoutService;
  pageLayoutTabService: PageLayoutTabService;
  pageLayoutWidgetService: PageLayoutWidgetService;
};

export type PageLayoutToolContext = {
  workspaceId: string;
};
