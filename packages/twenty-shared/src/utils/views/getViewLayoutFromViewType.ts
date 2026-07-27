import { ViewType } from '@/types';

type ViewTypeValue = `${ViewType}`;

const VIEW_TYPE_TO_LAYOUT_MAPPING: Record<ViewTypeValue, ViewTypeValue> = {
  [ViewType.TABLE]: ViewType.TABLE,
  [ViewType.KANBAN]: ViewType.KANBAN,
  [ViewType.CALENDAR]: ViewType.CALENDAR,
  [ViewType.FIELDS_WIDGET]: ViewType.FIELDS_WIDGET,
  [ViewType.TABLE_WIDGET]: ViewType.TABLE,
  [ViewType.KANBAN_WIDGET]: ViewType.KANBAN,
  [ViewType.CALENDAR_WIDGET]: ViewType.CALENDAR,
};

export const getViewLayoutFromViewType = (
  viewType: ViewTypeValue,
): ViewTypeValue => {
  return VIEW_TYPE_TO_LAYOUT_MAPPING[viewType];
};
