import { type STANDARD_OBJECTS } from 'twenty-shared/metadata';

export const INBOX_THREAD_VIEW_FIELD_DEFINITIONS = [
  { fieldName: 'title', isVisible: true },
  { fieldName: 'channelId', isVisible: true },
  { fieldName: 'lastMessageSenderWorkspaceMemberId', isVisible: true },
  { fieldName: 'lastMessageText', isVisible: true },
  { fieldName: 'assignee', isVisible: false },
  { fieldName: 'createdAt', isVisible: false },
] as const satisfies readonly {
  fieldName: keyof typeof STANDARD_OBJECTS.agentChatThread.fields;
  isVisible: boolean;
}[];
