import { FRONT_COMPONENT_WIDGET_PAGE_LAYOUT_TYPES } from '@/application/constants/FrontComponentWidgetPageLayoutTypes';
import { type FrontComponentWidgetPageLayoutType } from '@/application/frontComponentManifestType';

export const isFrontComponentWidgetPageLayoutType = (
  pageLayoutType: string,
): pageLayoutType is FrontComponentWidgetPageLayoutType =>
  FRONT_COMPONENT_WIDGET_PAGE_LAYOUT_TYPES.some(
    (widgetPageLayoutType) => widgetPageLayoutType === pageLayoutType,
  );
