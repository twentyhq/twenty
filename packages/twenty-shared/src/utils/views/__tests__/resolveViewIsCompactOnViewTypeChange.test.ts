import { ViewType } from '@/types';
import { resolveViewIsCompactOnViewTypeChange } from '@/utils/views/resolveViewIsCompactOnViewTypeChange';

describe('resolveViewIsCompactOnViewTypeChange', () => {
  it.each([
    [ViewType.TABLE, ViewType.LIST],
    [ViewType.KANBAN, ViewType.LIST],
    [ViewType.TABLE_WIDGET, ViewType.LIST_WIDGET],
  ])(
    'should make a view compact when %s becomes %s',
    (fromViewType, toViewType) => {
      expect(
        resolveViewIsCompactOnViewTypeChange({
          fromViewType,
          toViewType,
          isCompact: false,
        }),
      ).toBe(true);
    },
  );

  it.each([
    [ViewType.LIST, ViewType.KANBAN],
    [ViewType.LIST_WIDGET, ViewType.TABLE_WIDGET],
  ])(
    'should drop the list default when %s becomes %s',
    (fromViewType, toViewType) => {
      expect(
        resolveViewIsCompactOnViewTypeChange({
          fromViewType,
          toViewType,
          isCompact: true,
        }),
      ).toBe(false);
    },
  );

  it.each([true, false])(
    'should keep isCompact %s between layouts sharing a default',
    (isCompact) => {
      expect(
        resolveViewIsCompactOnViewTypeChange({
          fromViewType: ViewType.KANBAN,
          toViewType: ViewType.CALENDAR,
          isCompact,
        }),
      ).toBe(isCompact);
      expect(
        resolveViewIsCompactOnViewTypeChange({
          fromViewType: ViewType.LIST,
          toViewType: ViewType.LIST_WIDGET,
          isCompact,
        }),
      ).toBe(isCompact);
    },
  );
});
