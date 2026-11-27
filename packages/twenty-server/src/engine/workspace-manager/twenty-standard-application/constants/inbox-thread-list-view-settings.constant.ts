import { type STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewType } from 'twenty-shared/types';

export const INBOX_THREAD_LIST_VIEW_SETTINGS = {
  type: ViewType.LIST,
  isCompact: false,
  listPinnedFieldName: 'lastActivityAt',
} as const satisfies {
  type: ViewType;
  isCompact: boolean;
  listPinnedFieldName: keyof typeof STANDARD_OBJECTS.agentChatThread.fields;
};
