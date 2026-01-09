import { type STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { type AllStandardPageLayoutName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-page-layout-name.type';

export type AllStandardPageLayoutTabName<
  T extends AllStandardPageLayoutName = AllStandardPageLayoutName,
> = keyof (typeof STANDARD_PAGE_LAYOUTS)[T]['tabs'];
