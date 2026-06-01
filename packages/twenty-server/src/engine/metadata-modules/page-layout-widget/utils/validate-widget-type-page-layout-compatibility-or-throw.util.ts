import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import {
  PageLayoutWidgetException,
  PageLayoutWidgetExceptionCode,
} from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';

export const validateWidgetTypePageLayoutCompatibilityOrThrow = ({
  widgetType,
  pageLayoutTabId,
  flatPageLayoutTabMaps,
  flatPageLayoutMaps,
}: {
  widgetType: WidgetType;
  pageLayoutTabId: string;
} & Pick<AllFlatEntityMaps, 'flatPageLayoutTabMaps' | 'flatPageLayoutMaps'>): void => {
  if (widgetType !== WidgetType.STANDALONE_RICH_TEXT) {
    return;
  }

  const pageLayoutTab = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: pageLayoutTabId,
    flatEntityMaps: flatPageLayoutTabMaps,
  });

  if (!isDefined(pageLayoutTab)) {
    return;
  }

  const pageLayout = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: pageLayoutTab.pageLayoutId,
    flatEntityMaps: flatPageLayoutMaps,
  });

  if (!isDefined(pageLayout)) {
    return;
  }

  if (pageLayout.type === PageLayoutType.DASHBOARD) {
    return;
  }

  throw new PageLayoutWidgetException(
    `Widget type ${widgetType} is only supported on ${PageLayoutType.DASHBOARD} page layouts`,
    PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
  );
};
