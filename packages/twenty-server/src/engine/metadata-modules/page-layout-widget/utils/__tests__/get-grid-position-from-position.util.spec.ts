import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { getGridPositionFromPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/get-grid-position-from-position.util';

describe('getGridPositionFromPosition', () => {
  it('maps a grid position to its coordinates', () => {
    expect(
      getGridPositionFromPosition({
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 2,
        column: 3,
        rowSpan: 4,
        columnSpan: 5,
      }),
    ).toEqual({ row: 2, column: 3, rowSpan: 4, columnSpan: 5 });
  });

  it('falls back to a unit grid position for a vertical list position', () => {
    expect(
      getGridPositionFromPosition({
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: 0,
      }),
    ).toEqual({ row: 0, column: 0, rowSpan: 1, columnSpan: 1 });
  });

  it('falls back to a unit grid position for a canvas position', () => {
    expect(
      getGridPositionFromPosition({
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
      }),
    ).toEqual({ row: 0, column: 0, rowSpan: 1, columnSpan: 1 });
  });
});
