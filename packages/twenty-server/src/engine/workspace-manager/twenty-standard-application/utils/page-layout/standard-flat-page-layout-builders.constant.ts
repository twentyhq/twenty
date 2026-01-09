import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { type AllStandardPageLayoutName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-name.type';
import {
  type CreateStandardPageLayoutArgs,
  createStandardPageLayoutFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout/create-standard-page-layout-flat-metadata.util';

export const STANDARD_FLAT_PAGE_LAYOUT_BUILDERS_BY_LAYOUT_NAME = {
  myFirstDashboard: (args: Omit<CreateStandardPageLayoutArgs, 'context'>) =>
    createStandardPageLayoutFlatMetadata({
      ...args,
      context: {
        layoutName: 'myFirstDashboard',
        name: 'My First Dashboard',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
      },
    }),
} satisfies {
  [P in AllStandardPageLayoutName]: (
    args: Omit<CreateStandardPageLayoutArgs, 'context'>,
  ) => FlatPageLayout;
};
