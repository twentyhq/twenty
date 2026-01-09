import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import {
  STANDARD_PAGE_LAYOUTS,
  type StandardPageLayoutName,
  type StandardPageLayoutTabName,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import {
  type CreateStandardPageLayoutTabArgs,
  createStandardPageLayoutTabFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-tab/create-standard-page-layout-tab-flat-metadata.util';

type TabBuilderArgs = Omit<CreateStandardPageLayoutTabArgs, 'context'>;

export const STANDARD_FLAT_PAGE_LAYOUT_TAB_BUILDERS_BY_LAYOUT_NAME = {
  myFirstDashboard: {
    tab1: (args: TabBuilderArgs) =>
      createStandardPageLayoutTabFlatMetadata({
        ...args,
        context: {
          layoutName: 'myFirstDashboard',
          tabName: 'tab1',
          title: STANDARD_PAGE_LAYOUTS.myFirstDashboard.tabs.tab1.title,
          position: STANDARD_PAGE_LAYOUTS.myFirstDashboard.tabs.tab1.position,
        },
      }),
  },
} satisfies {
  [L in StandardPageLayoutName]: {
    [T in StandardPageLayoutTabName<L>]: (
      args: TabBuilderArgs,
    ) => FlatPageLayoutTab;
  };
};

