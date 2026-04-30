import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { getDefaultPageLayoutWidgetPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/get-default-page-layout-widget-position.util';

describe('getDefaultPageLayoutWidgetPosition', () => {
  it('returns a CANVAS shape for CANVAS layoutMode', () => {
    expect(
      getDefaultPageLayoutWidgetPosition(PageLayoutTabLayoutMode.CANVAS, 0),
    ).toEqual({ layoutMode: PageLayoutTabLayoutMode.CANVAS });
  });

  it('returns a VERTICAL_LIST shape using the widget index', () => {
    expect(
      getDefaultPageLayoutWidgetPosition(
        PageLayoutTabLayoutMode.VERTICAL_LIST,
        4,
      ),
    ).toEqual({
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 4,
    });
  });

  it('returns a GRID cell at the index column on row 0 below the wrap point', () => {
    expect(
      getDefaultPageLayoutWidgetPosition(PageLayoutTabLayoutMode.GRID, 5),
    ).toEqual({
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 0,
      column: 5,
      rowSpan: 1,
      columnSpan: 1,
    });
  });

  it('wraps GRID defaults onto the next row past the column limit', () => {
    expect(
      getDefaultPageLayoutWidgetPosition(PageLayoutTabLayoutMode.GRID, 13),
    ).toEqual({
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 1,
      column: 1,
      rowSpan: 1,
      columnSpan: 1,
    });
  });
});
