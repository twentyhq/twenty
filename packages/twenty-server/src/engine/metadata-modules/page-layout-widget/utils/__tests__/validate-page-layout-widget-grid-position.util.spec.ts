import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetGridPosition,
} from 'twenty-shared/types';

import { WIDGET_GRID_MAX_COLUMNS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-columns.constant';
import { WIDGET_GRID_MAX_ROWS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-rows.constant';
import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validatePageLayoutWidgetGridPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-page-layout-widget-grid-position.util';

describe('validatePageLayoutWidgetGridPosition', () => {
  const validGridPosition: PageLayoutWidgetGridPosition = {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: 2,
    columnSpan: 3,
  };

  describe('Valid grid positions', () => {
    it('should return empty array for valid grid position', () => {
      const errors = validatePageLayoutWidgetGridPosition(
        validGridPosition,
        'Test Widget',
      );

      expect(errors).toEqual([]);
    });

    it('should return empty array for widget at max column boundary', () => {
      const errors = validatePageLayoutWidgetGridPosition(
        {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: 0,
          column: WIDGET_GRID_MAX_COLUMNS - 1,
          rowSpan: 1,
          columnSpan: 1,
        },
        'Test Widget',
      );

      expect(errors).toEqual([]);
    });

    it('should return empty array for widget at max row boundary', () => {
      const errors = validatePageLayoutWidgetGridPosition(
        {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: WIDGET_GRID_MAX_ROWS - 1,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
        'Test Widget',
      );

      expect(errors).toEqual([]);
    });

    it('should return empty array for widget spanning to column grid edge', () => {
      const errors = validatePageLayoutWidgetGridPosition(
        {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: 0,
          column: 8,
          rowSpan: 1,
          columnSpan: 4,
        },
        'Test Widget',
      );

      expect(errors).toEqual([]);
    });

    it('should return empty array for widget spanning to row grid edge', () => {
      const errors = validatePageLayoutWidgetGridPosition(
        {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: WIDGET_GRID_MAX_ROWS - 5,
          column: 0,
          rowSpan: 5,
          columnSpan: 6,
        },
        'Test Widget',
      );

      expect(errors).toEqual([]);
    });
  });

  it.each([
    { row: -1 },
    { column: -1 },
    { rowSpan: 0 },
    { columnSpan: 0 },
    { row: 0.5 },
    { column: 0.5 },
    { rowSpan: 1.5 },
    { columnSpan: 1.5 },
    { row: undefined },
  ])('rejects invalid grid coordinates: %j', (invalidCoordinates) => {
    const errors = validatePageLayoutWidgetGridPosition(
      {
        ...validGridPosition,
        ...invalidCoordinates,
      } as PageLayoutWidgetGridPosition,
      'Test Widget',
    );

    expect(errors).toEqual([
      expect.objectContaining({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      }),
    ]);
  });

  describe('Invalid row positions', () => {
    it('should return error for row exceeding max rows', () => {
      const errors = validatePageLayoutWidgetGridPosition(
        { ...validGridPosition, row: WIDGET_GRID_MAX_ROWS },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].code).toBe(
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    });

    it('should return error when widget extends beyond grid height', () => {
      const errors = validatePageLayoutWidgetGridPosition(
        {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: WIDGET_GRID_MAX_ROWS - 2,
          column: 0,
          rowSpan: 5,
          columnSpan: 6,
        },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) =>
          error.message.includes('extends beyond grid height'),
        ),
      ).toBe(true);
    });
  });

  describe('Invalid column positions', () => {
    it('should return error for column exceeding max columns', () => {
      const errors = validatePageLayoutWidgetGridPosition(
        { ...validGridPosition, column: WIDGET_GRID_MAX_COLUMNS },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].code).toBe(
        PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
      );
    });
  });

  describe('Widget extending beyond grid', () => {
    it('should return error when widget extends beyond grid width', () => {
      const errors = validatePageLayoutWidgetGridPosition(
        {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: 0,
          column: 10,
          rowSpan: 1,
          columnSpan: 3,
        },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) =>
          error.message.includes('extends beyond grid width'),
        ),
      ).toBe(true);
    });
  });

  describe('Error messages', () => {
    it('should include max columns value in error', () => {
      const errors = validatePageLayoutWidgetGridPosition(
        {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: 0,
          column: 10,
          rowSpan: 1,
          columnSpan: 5,
        },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) =>
          error.message.includes(WIDGET_GRID_MAX_COLUMNS.toString()),
        ),
      ).toBe(true);
    });

    it('should include max rows value in error for row start', () => {
      const errors = validatePageLayoutWidgetGridPosition(
        {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: WIDGET_GRID_MAX_ROWS + 10,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) =>
          error.message.includes(WIDGET_GRID_MAX_ROWS.toString()),
        ),
      ).toBe(true);
    });

    it('should include max rows value in error for row extension', () => {
      const errors = validatePageLayoutWidgetGridPosition(
        {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: 95,
          column: 0,
          rowSpan: 10,
          columnSpan: 6,
        },
        'Test Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) =>
          error.message.includes(WIDGET_GRID_MAX_ROWS.toString()),
        ),
      ).toBe(true);
    });

    it('should include widget title in error message', () => {
      const errors = validatePageLayoutWidgetGridPosition(
        {
          layoutMode: PageLayoutTabLayoutMode.GRID,
          row: WIDGET_GRID_MAX_ROWS,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
        'My Custom Widget',
      );

      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) => error.message.includes('My Custom Widget')),
      ).toBe(true);
    });
  });
});
