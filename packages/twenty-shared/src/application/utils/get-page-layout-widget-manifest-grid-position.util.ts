import { type PageLayoutWidgetManifest } from '@/application/pageLayoutManifestType';
import { DEFAULT_WIDGET_SIZE } from '@/constants';
import { type GridPosition } from '@/types';

export const getPageLayoutWidgetManifestGridPosition = (
  pageLayoutWidgetManifest: Pick<PageLayoutWidgetManifest, 'gridPosition'>,
): GridPosition =>
  pageLayoutWidgetManifest.gridPosition ?? {
    row: 0,
    column: 0,
    rowSpan: DEFAULT_WIDGET_SIZE.default.h,
    columnSpan: DEFAULT_WIDGET_SIZE.default.w,
  };
