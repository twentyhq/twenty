import { isDefined } from 'twenty-shared/utils';

import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';

export const fromFlatPageLayoutTabToPageLayoutTabDto = (
  flatPageLayoutTab: FlatPageLayoutTab,
): Omit<PageLayoutTabDTO, 'widgets'> => {
  const {
    createdAt,
    updatedAt,
    deletedAt,
    widgetIds: _widgetIds,
    ...rest
  } = flatPageLayoutTab;

  return {
    ...rest,
    isOverridden:
      isDefined(rest.overrides) && Object.keys(rest.overrides).length > 0,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    deletedAt: deletedAt ? new Date(deletedAt) : null,
  };
};
