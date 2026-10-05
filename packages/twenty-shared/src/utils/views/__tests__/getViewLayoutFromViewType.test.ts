import { ViewType } from '@/types';
import { getViewLayoutFromViewType } from '@/utils/views/getViewLayoutFromViewType';

describe('getViewLayoutFromViewType', () => {
  it.each([
    [ViewType.TABLE_WIDGET, ViewType.TABLE],
    [ViewType.KANBAN_WIDGET, ViewType.KANBAN],
    [ViewType.LIST_WIDGET, ViewType.LIST],
    [ViewType.CALENDAR_WIDGET, ViewType.CALENDAR],
  ])('should reduce %s to its %s layout', (viewType, expectedLayout) => {
    expect(getViewLayoutFromViewType(viewType)).toBe(expectedLayout);
  });

  it.each([ViewType.TABLE, ViewType.KANBAN, ViewType.LIST, ViewType.CALENDAR])(
    'should leave the %s layout unchanged',
    (viewType) => {
      expect(getViewLayoutFromViewType(viewType)).toBe(viewType);
    },
  );
});
