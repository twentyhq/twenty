import { WIDGET_GRID_MAX_COLUMNS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-columns.constant';
import { WIDGET_GRID_MAX_ROWS } from 'src/engine/metadata-modules/page-layout-widget/constants/widget-grid-max-rows.constant';
import { PageLayoutWidgetException } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validateWidgetGridPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-grid-position.util';

describe('validateWidgetGridPosition', () => {
  const validGridPosition = {
    row: 0,
    column: 0,
    rowSpan: 2,
    columnSpan: 3,
  };

  describe('Valid grid positions', () => {
    it('should not throw for valid grid position', () => {
      expect(() =>
        validateWidgetGridPosition(validGridPosition, 'Test Widget'),
      ).not.toThrow();
    });

    it('should not throw for widget at max column boundary', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: 0,
            column: WIDGET_GRID_MAX_COLUMNS - 1,
            rowSpan: 1,
            columnSpan: 1,
          },
          'Test Widget',
        ),
      ).not.toThrow();
    });

    it('should not throw for widget at max row boundary', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: WIDGET_GRID_MAX_ROWS - 1,
            column: 0,
            rowSpan: 1,
            columnSpan: 1,
          },
          'Test Widget',
        ),
      ).not.toThrow();
    });

    it('should not throw for widget spanning to column grid edge', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: 0,
            column: 8,
            rowSpan: 1,
            columnSpan: 4,
          },
          'Test Widget',
        ),
      ).not.toThrow();
    });

    it('should not throw for widget spanning to row grid edge', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: WIDGET_GRID_MAX_ROWS - 5,
            column: 0,
            rowSpan: 5,
            columnSpan: 6,
          },
          'Test Widget',
        ),
      ).not.toThrow();
    });
  });

  describe('Invalid row positions', () => {
    it('should throw for row exceeding max rows', () => {
      expect(() =>
        validateWidgetGridPosition(
          { ...validGridPosition, row: WIDGET_GRID_MAX_ROWS },
          'Test Widget',
        ),
      ).toThrow(PageLayoutWidgetException);
    });

    it('should throw when widget extends beyond grid height', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: WIDGET_GRID_MAX_ROWS - 2,
            column: 0,
            rowSpan: 5,
            columnSpan: 6,
          },
          'Test Widget',
        ),
      ).toThrow(/extends beyond grid height/);
    });
  });

  describe('Invalid column positions', () => {
    it('should throw for column exceeding max columns', () => {
      expect(() =>
        validateWidgetGridPosition(
          { ...validGridPosition, column: WIDGET_GRID_MAX_COLUMNS },
          'Test Widget',
        ),
      ).toThrow(PageLayoutWidgetException);
    });
  });

  describe('Widget extending beyond grid', () => {
    it('should throw when widget extends beyond grid width', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: 0,
            column: 10,
            rowSpan: 1,
            columnSpan: 3,
          },
          'Test Widget',
        ),
      ).toThrow(/extends beyond grid width/);
    });
  });

  describe('Error messages', () => {
    it('should include max columns value in error', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: 0,
            column: 10,
            rowSpan: 1,
            columnSpan: 5,
          },
          'Test Widget',
        ),
      ).toThrow(new RegExp(WIDGET_GRID_MAX_COLUMNS.toString()));
    });

    it('should include max rows value in error for row start', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: WIDGET_GRID_MAX_ROWS + 10,
            column: 0,
            rowSpan: 1,
            columnSpan: 1,
          },
          'Test Widget',
        ),
      ).toThrow(new RegExp(WIDGET_GRID_MAX_ROWS.toString()));
    });

    it('should include max rows value in error for row extension', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: 95,
            column: 0,
            rowSpan: 10,
            columnSpan: 6,
          },
          'Test Widget',
        ),
      ).toThrow(new RegExp(WIDGET_GRID_MAX_ROWS.toString()));
    });

    it('should include widget title in error message', () => {
      expect(() =>
        validateWidgetGridPosition(
          {
            row: WIDGET_GRID_MAX_ROWS,
            column: 0,
            rowSpan: 1,
            columnSpan: 1,
          },
          'My Custom Widget',
        ),
      ).toThrow(/My Custom Widget/);
    });
  });
});
