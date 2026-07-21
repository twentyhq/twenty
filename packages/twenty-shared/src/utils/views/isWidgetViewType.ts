import { ViewType } from '@/types';

type ViewTypeValue = `${ViewType}`;

const WIDGET_VIEW_TYPES: ViewTypeValue[] = [
  ViewType.FIELDS_WIDGET,
  ViewType.TABLE_WIDGET,
  ViewType.KANBAN_WIDGET,
  ViewType.CALENDAR_WIDGET,
];

export const isWidgetViewType = (viewType: ViewTypeValue): boolean => {
  return WIDGET_VIEW_TYPES.includes(viewType);
};
