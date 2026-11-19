import { CONDITIONAL_AVAILABILITY_MAX_NODE_COUNT } from 'twenty-shared/constants';

import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validatePageLayoutWidgetConditionalAvailability } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-page-layout-widget-conditional-availability.util';

const validate = (conditionalAvailability: unknown) =>
  validatePageLayoutWidgetConditionalAvailability({ conditionalAvailability });

describe('validatePageLayoutWidgetConditionalAvailability', () => {
  it('should accept a widget without a rule', () => {
    expect(validate(null)).toEqual([]);
  });

  it('should refuse a value that is not a tree', () => {
    expect(validate({ type: 'UNKNOWN_KIND' })).toMatchObject([
      {
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: expect.stringContaining('Invalid visibility restriction'),
        value: { errorCode: 'INVALID_NODE' },
      },
    ]);
  });

  it('should refuse an unknown variable', () => {
    expect(validate({ type: 'PATH', path: 'devise' })).toMatchObject([
      {
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: expect.stringContaining('"devise"'),
        value: { errorCode: 'UNKNOWN_NAME', errorParams: { name: 'devise' } },
      },
    ]);
  });

  it('should refuse a tree with too many parts', () => {
    expect(
      validate({
        type: 'GROUP',
        logicalOperator: 'OR',
        children: Array.from(
          { length: CONDITIONAL_AVAILABILITY_MAX_NODE_COUNT },
          () => ({ type: 'LITERAL', value: true }),
        ),
      }),
    ).toMatchObject([
      {
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        value: { errorCode: 'RULE_TOO_LARGE' },
      },
    ]);
  });
});
