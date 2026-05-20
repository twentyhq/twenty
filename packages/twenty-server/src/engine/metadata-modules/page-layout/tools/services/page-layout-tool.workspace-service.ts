import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { createAddPageLayoutTabTool } from 'src/engine/metadata-modules/page-layout/tools/add-page-layout-tab.tool';
import { createAddPageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/add-page-layout-widget.tool';
import { createCreateCompletePageLayoutTool } from 'src/engine/metadata-modules/page-layout/tools/create-complete-page-layout.tool';
import { createDeletePageLayoutTool } from 'src/engine/metadata-modules/page-layout/tools/delete-page-layout.tool';
import { createDeletePageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/delete-page-layout-widget.tool';
import { createGetPageLayoutTool } from 'src/engine/metadata-modules/page-layout/tools/get-page-layout.tool';
import { createListPageLayoutsTool } from 'src/engine/metadata-modules/page-layout/tools/list-page-layouts.tool';
import { type PageLayoutToolDependencies } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';
import { createUpdatePageLayoutWidgetTool } from 'src/engine/metadata-modules/page-layout/tools/update-page-layout-widget.tool';

@Injectable()
export class PageLayoutToolWorkspaceService {
  private readonly deps: PageLayoutToolDependencies;

  constructor(
    pageLayoutService: PageLayoutService,
    pageLayoutTabService: PageLayoutTabService,
    pageLayoutWidgetService: PageLayoutWidgetService,
  ) {
    this.deps = {
      pageLayoutService,
      pageLayoutTabService,
      pageLayoutWidgetService,
    };
  }

  generatePageLayoutTools(workspaceId: string): ToolSet {
    const context = { workspaceId };

    const listPageLayouts = createListPageLayoutsTool(this.deps, context);
    const getPageLayout = createGetPageLayoutTool(this.deps, context);
    const createCompletePageLayout = createCreateCompletePageLayoutTool(
      this.deps,
      context,
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
    const deletePageLayout = createDeletePageLayoutTool(this.deps, context);

    return {
      [listPageLayouts.name]: listPageLayouts,
      [getPageLayout.name]: getPageLayout,
      [createCompletePageLayout.name]: createCompletePageLayout,
      [addPageLayoutTab.name]: addPageLayoutTab,
      [addPageLayoutWidget.name]: addPageLayoutWidget,
      [updatePageLayoutWidget.name]: updatePageLayoutWidget,
      [deletePageLayoutWidget.name]: deletePageLayoutWidget,
      [deletePageLayout.name]: deletePageLayout,
    };
  }
}
