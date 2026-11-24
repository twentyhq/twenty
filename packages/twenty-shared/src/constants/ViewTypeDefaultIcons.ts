import { ViewType } from '@/types';

type ViewTypeValue = `${ViewType}`;

export const VIEW_TYPE_DEFAULT_ICONS = {
  [ViewType.TABLE]: 'IconTable',
  [ViewType.KANBAN]: 'IconLayoutKanban',
  [ViewType.CALENDAR]: 'IconCalendar',
  [ViewType.LIST]: 'IconList',
  [ViewType.INBOX]: 'IconInbox',
  [ViewType.FIELDS_WIDGET]: 'IconListDetails',
  [ViewType.TABLE_WIDGET]: 'IconTable',
  [ViewType.KANBAN_WIDGET]: 'IconLayoutKanban',
  [ViewType.LIST_WIDGET]: 'IconList',
  [ViewType.CALENDAR_WIDGET]: 'IconCalendar',
} as const satisfies Record<ViewTypeValue, string>;
