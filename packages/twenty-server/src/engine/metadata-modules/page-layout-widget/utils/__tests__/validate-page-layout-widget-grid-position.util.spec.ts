import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetGridPosition,
} from 'twenty-shared/types';

import { validatePageLayoutWidgetGridPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-page-layout-widget-grid-position.util';

describe('validatePageLayoutWidgetGridPosition', () => {
  const validPosition: PageLayoutWidgetGridPosition = {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: 1,
    columnSpan: 1,
  };

  it('returns no error for a well-formed grid position', () => {
    expect(
      validatePageLayoutWidgetGridPosition(validPosition, 'Widget'),
    ).toEqual([]);
  });

  it('rejects a position with missing numeric coordinates', () => {
    const position = {
      layoutMode: PageLayoutTabLayoutMode.GRID,
    } as unknown as PageLayoutWidgetGridPosition;

    const errors = validatePageLayoutWidgetGridPosition(position, 'Widget');

    expect(errors).toHaveLength(4);
    expect(errors.map((error) => error.message)).toEqual([
      expect.stringContaining('row must be a number'),
      expect.stringContaining('column must be a number'),
      expect.stringContaining('rowSpan must be a number'),
      expect.stringContaining('columnSpan must be a number'),
    ]);
  });

  it('rejects a position with a non-finite span', () => {
    const position = {
      ...validPosition,
      columnSpan: Number.NaN,
    };

    const errors = validatePageLayoutWidgetGridPosition(position, 'Widget');

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('columnSpan must be a number');
  });
});
