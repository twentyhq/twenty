import { type STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type AllStandardPageLayoutName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-name.type';
import { type AllStandardPageLayoutTabName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-tab-name.type';

export type AllStandardPageLayoutWidgetName<
  PageLayout extends AllStandardPageLayoutName,
  PageLayouTab extends AllStandardPageLayoutTabName<PageLayout>,
> = (typeof STANDARD_PAGE_LAYOUTS)[PageLayout]['tabs'][PageLayouTab] extends {
  widgets: infer Widgets;
}
  ? keyof Widgets
  : never;
