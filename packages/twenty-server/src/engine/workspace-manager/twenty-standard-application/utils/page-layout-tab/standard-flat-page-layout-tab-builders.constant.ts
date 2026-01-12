import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import {} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type AllStandardPageLayoutName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-name.type';
import { type AllStandardPageLayoutTabName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-tab-name.type';
import {
  type CreateStandardPageLayoutTabArgs,
  createStandardPageLayoutTabFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-tab/create-standard-page-layout-tab-flat-metadata.util';

type TabBuilderArgs = Omit<CreateStandardPageLayoutTabArgs, 'context'>;

export const STANDARD_FLAT_PAGE_LAYOUT_TAB_BUILDERS_BY_LAYOUT_NAME = {
  tab1: (args: TabBuilderArgs) =>
    createStandardPageLayoutTabFlatMetadata({
      ...args,
      context: {
        layoutName: 'myFirstDashboard',
        tabName: 'tab1',
        title: 'Tab 1',
        position: 0,
      },
    }),
} satisfies {
  [T in AllStandardPageLayoutTabName<AllStandardPageLayoutName>]: (
    args: TabBuilderArgs,
  ) => FlatPageLayoutTab;
};
