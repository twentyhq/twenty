import { ViewType } from '@/types';

type ViewTypeValue = `${ViewType}`;

export const VIEW_TYPE_DEFAULT_ICONS = {
  [ViewType.TABLE]: 'IconTable',
  [ViewType.KANBAN]: 'IconLayoutKanban',
  [ViewType.CALENDAR]: 'IconCalendar',
  [ViewType.FIELDS_WIDGET]: 'IconListDetails',
  [ViewType.TABLE_WIDGET]: 'IconTable',
  [ViewType.KANBAN_WIDGET]: 'IconLayoutKanban',
  [ViewType.CALENDAR_WIDGET]: 'IconCalendar',
} as const satisfies Record<ViewTypeValue, string>;
