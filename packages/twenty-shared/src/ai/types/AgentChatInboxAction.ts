export type AgentChatInboxAction =
  | 'READ'
  | 'UNREAD'
  | 'ARCHIVE'
  | 'ARCHIVE_IF_SETTLED'
  | 'SNOOZE'
  | 'MOVE_TO_INBOX'
  | 'SUBSCRIBE'
  | 'UNSUBSCRIBE';
