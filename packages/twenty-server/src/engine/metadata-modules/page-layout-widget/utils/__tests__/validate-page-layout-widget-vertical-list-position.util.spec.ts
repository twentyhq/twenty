import {
  PageLayoutTabLayoutMode,
  type PageLayoutWidgetVerticalListPosition,
  PageLayoutWidgetVerticalListHeightBehavior,
} from 'twenty-shared/types';

import { PageLayoutWidgetExceptionCode } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validatePageLayoutWidgetVerticalListPosition } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-page-layout-widget-vertical-list-position.util';

describe('validatePageLayoutWidgetVerticalListPosition', () => {
  const validPosition: PageLayoutWidgetVerticalListPosition = {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index: 0,
  };

  it.each([
    undefined,
    PageLayoutWidgetVerticalListHeightBehavior.FIT_CONTENT,
    PageLayoutWidgetVerticalListHeightBehavior.TAB_VIEWPORT,
  ])('accepts height behavior %s', (heightBehavior) => {
    expect(
      validatePageLayoutWidgetVerticalListPosition(
        { ...validPosition, heightBehavior },
        'Widget',
      ),
    ).toEqual([]);
  });

  it('rejects an unsupported height behavior', () => {
    const errors = validatePageLayoutWidgetVerticalListPosition(
      {
        ...validPosition,
        heightBehavior: 'FULL_PAGE',
      } as unknown as PageLayoutWidgetVerticalListPosition,
      'Widget',
    );

    expect(errors).toEqual([
      expect.objectContaining({
        code: PageLayoutWidgetExceptionCode.INVALID_PAGE_LAYOUT_WIDGET_DATA,
        message: expect.stringContaining('height behavior FULL_PAGE'),
      }),
    ]);
  });
});
