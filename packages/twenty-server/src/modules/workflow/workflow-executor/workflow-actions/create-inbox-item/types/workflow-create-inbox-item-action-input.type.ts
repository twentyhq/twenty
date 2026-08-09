import { type InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';

export type WorkflowCreateInboxItemActionInput = {
  title: string;
  preview?: string;
  typeKey: string;
  queueId?: string;
  assigneeWorkspaceMemberId?: string;
  priority?: InboxItemPriority;
  slotKey?: string;
};
