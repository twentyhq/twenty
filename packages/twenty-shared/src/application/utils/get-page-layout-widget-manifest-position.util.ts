import { type PageLayoutWidgetManifest } from '@/application/pageLayoutManifestType';
import { getPageLayoutWidgetManifestGridPosition } from '@/application/utils/get-page-layout-widget-manifest-grid-position.util';
import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
} from '@/types';

export const getPageLayoutWidgetManifestPosition = ({
  pageLayoutWidgetManifest,
  pageLayoutTabLayoutMode,
  widgetIndex,
}: {
  pageLayoutWidgetManifest: Pick<
    PageLayoutWidgetManifest,
    'gridPosition' | 'position'
  >;
  pageLayoutTabLayoutMode: PageLayoutTabLayoutMode;
  widgetIndex: number;
}): PageLayoutWidgetPosition => {
  if (pageLayoutWidgetManifest.position) {
    return pageLayoutWidgetManifest.position;
  }

  switch (pageLayoutTabLayoutMode) {
    case PageLayoutTabLayoutMode.VERTICAL_LIST:
      return {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: widgetIndex,
      };
    case PageLayoutTabLayoutMode.CANVAS:
      return {
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
      };
    case PageLayoutTabLayoutMode.GRID:
      return {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        ...getPageLayoutWidgetManifestGridPosition(pageLayoutWidgetManifest),
      };
  }
};
