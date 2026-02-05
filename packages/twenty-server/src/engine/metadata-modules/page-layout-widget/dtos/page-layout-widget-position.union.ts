import { createUnionType } from '@nestjs/graphql';

import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
} from 'twenty-shared/types';

import { PageLayoutWidgetCanvasPositionDTO } from './page-layout-widget-canvas-position.dto';
import { PageLayoutWidgetGridPositionDTO } from './page-layout-widget-grid-position.dto';
import { PageLayoutWidgetVerticalListPositionDTO } from './page-layout-widget-vertical-list-position.dto';

export const PageLayoutWidgetPositionUnion = createUnionType({
  name: 'PageLayoutWidgetPosition',
  types: () => [
    PageLayoutWidgetGridPositionDTO,
    PageLayoutWidgetVerticalListPositionDTO,
    PageLayoutWidgetCanvasPositionDTO,
  ],
  resolveType({ layoutMode }: PageLayoutWidgetPosition) {
    switch (layoutMode) {
      case PageLayoutTabLayoutMode.GRID:
        return PageLayoutWidgetGridPositionDTO;
      case PageLayoutTabLayoutMode.VERTICAL_LIST:
        return PageLayoutWidgetVerticalListPositionDTO;
      case PageLayoutTabLayoutMode.CANVAS:
        return PageLayoutWidgetCanvasPositionDTO;
    }
  },
});
