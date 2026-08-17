import { ViewType } from '@/types';
import { isWidgetViewType } from '@/utils/views/isWidgetViewType';

describe('isWidgetViewType', () => {
  it.each([
    ViewType.FIELDS_WIDGET,
    ViewType.TABLE_WIDGET,
    ViewType.KANBAN_WIDGET,
    ViewType.LIST_WIDGET,
    ViewType.CALENDAR_WIDGET,
  ])('should treat %s as a widget view type', (viewType) => {
    expect(isWidgetViewType(viewType)).toBe(true);
  });

  it.each([ViewType.TABLE, ViewType.KANBAN, ViewType.LIST, ViewType.CALENDAR])(
    'should keep %s out of view pickers as a record index type',
    (viewType) => {
      expect(isWidgetViewType(viewType)).toBe(false);
    },
  );
});
