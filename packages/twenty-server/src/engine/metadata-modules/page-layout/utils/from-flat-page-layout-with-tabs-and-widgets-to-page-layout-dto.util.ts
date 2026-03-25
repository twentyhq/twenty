import { type FlatPageLayoutWithTabsAndWidgets } from 'src/engine/metadata-modules/flat-page-layout/utils/reconstruct-flat-page-layout-with-tabs-and-widgets.util';
import { type PageLayoutDTO } from 'src/engine/metadata-modules/page-layout/dtos/page-layout.dto';
import { fromFlatPageLayoutTabWithWidgetsToPageLayoutTabDto } from 'src/engine/metadata-modules/page-layout-tab/utils/from-flat-page-layout-tab-with-widgets-to-page-layout-tab-dto.util';
import { fromFlatPageLayoutToPageLayoutDto } from 'src/engine/metadata-modules/page-layout/utils/from-flat-page-layout-to-page-layout-dto.util';

export const fromFlatPageLayoutWithTabsAndWidgetsToPageLayoutDto = (
  flatPageLayoutWithTabsAndWidgets: FlatPageLayoutWithTabsAndWidgets,
): PageLayoutDTO => {
  const { tabs, ...flatPageLayout } = flatPageLayoutWithTabsAndWidgets;

  return {
    ...fromFlatPageLayoutToPageLayoutDto(flatPageLayout),
    tabs: tabs.map(fromFlatPageLayoutTabWithWidgetsToPageLayoutTabDto),
  };
};
