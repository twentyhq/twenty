import { type InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';

export type WorkflowCreateInboxItemActionInput = {
  title: string;
  summary?: string;
  icon?: string;
  queueId?: string;
  assigneeWorkspaceMemberId?: string;
  priority?: InboxItemPriority;
  slotKey?: string;
};
