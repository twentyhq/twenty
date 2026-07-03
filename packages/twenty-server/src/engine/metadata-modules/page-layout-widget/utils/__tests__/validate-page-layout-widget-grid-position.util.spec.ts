import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validatePageLayoutWidgetGridPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-page-layout-widget-grid-position.util';

describe('validatePageLayoutWidgetGridPosition', () => {
  it('should return no errors for valid grid position', () => {
    const errors = validatePageLayoutWidgetGridPosition(
      {
        layoutMode: 'GRID',
        row: 0,
        column: 0,
        rowSpan: 1,
        columnSpan: 1,
      },
      'Test Widget',
    );

    expect(errors).toEqual([]);
  });

  it('should return an error when row is missing', () => {
    const errors = validatePageLayoutWidgetGridPosition(
      {
        layoutMode: 'GRID',
        column: 0,
        rowSpan: 1,
        columnSpan: 1,
      } as never,
      'Test Widget',
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe(
      PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
    );
    expect(errors[0].message).toContain('row must be an integer');
  });

  it('should return an error when row is not an integer', () => {
    const errors = validatePageLayoutWidgetGridPosition(
      {
        layoutMode: 'GRID',
        row: 1.5,
        column: 0,
        rowSpan: 1,
        columnSpan: 1,
      },
      'Test Widget',
    );

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('row must be an integer');
  });
});
