import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { normalizePageLayoutWidgetInputPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/normalize-page-layout-widget-input-position.util';

describe('normalizePageLayoutWidgetInputPosition', () => {
  it('passes through when only position is provided', () => {
    const input = {
      position: {
        layoutMode: PageLayoutTabLayoutMode.GRID,
        row: 2,
        column: 3,
        rowSpan: 1,
        columnSpan: 1,
      },
    } as const;

    expect(normalizePageLayoutWidgetInputPosition(input)).toEqual(input);
  });

  it('derives position from gridPosition when position is missing', () => {
    const result = normalizePageLayoutWidgetInputPosition({
      gridPosition: { row: 4, column: 5, rowSpan: 2, columnSpan: 3 },
    });

    expect(result.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 4,
      column: 5,
      rowSpan: 2,
      columnSpan: 3,
    });
  });

  it('keeps position when both are provided (position wins)', () => {
    const result = normalizePageLayoutWidgetInputPosition({
      position: { layoutMode: PageLayoutTabLayoutMode.CANVAS },
      gridPosition: { row: 1, column: 1, rowSpan: 1, columnSpan: 1 },
    });

    expect(result.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
    });
  });

  it('returns input unchanged when neither field is provided', () => {
    const input = { title: 'no position' };

    expect(normalizePageLayoutWidgetInputPosition(input)).toEqual(input);
  });
});
