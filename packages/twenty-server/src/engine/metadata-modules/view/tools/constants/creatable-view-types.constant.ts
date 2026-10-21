import { ViewType } from 'twenty-shared/types';

export const CREATABLE_VIEW_TYPES = [
  ViewType.TABLE,
  ViewType.LIST,
  ViewType.KANBAN,
  ViewType.CALENDAR,
  ViewType.TABLE_WIDGET,
  ViewType.KANBAN_WIDGET,
  ViewType.LIST_WIDGET,
  ViewType.CALENDAR_WIDGET,
] as const;
