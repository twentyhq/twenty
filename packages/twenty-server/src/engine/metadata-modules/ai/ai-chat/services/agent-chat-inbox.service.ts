import { Injectable } from '@nestjs/common';

import { INBOX_ITEM_TYPE_KEY } from 'src/engine/core-modules/inbox/constants/standard-inbox-item-types.constant';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';

type ThreadContext = {
  threadId: string;
  workspaceId: string;
  userWorkspaceId: string;
};

// Turns chat thread events into inbox items. A thread has exactly one item per
// owner for its whole life: these calls fold into it rather than stacking up.
@Injectable()
export class AgentChatInboxService {
  constructor(private readonly inboxRouterService: InboxRouterService) {}

  async onThreadCreated({
    threadId,
    workspaceId,
    userWorkspaceId,
    title,
  }: ThreadContext & { title?: string }): Promise<void> {
    await this.inboxRouterService.route({
      workspaceId,
      typeKey: INBOX_ITEM_TYPE_KEY.conversation,
      title,
      subject: {
        kind: 'thread',
        threadId,
        ownerUserWorkspaceId: userWorkspaceId,
      },
    });
  }

  // The agent finished a turn. If it ended by asking something, the item
  // becomes a question that needs an answer; otherwise it is an update.
  async onTurnCompleted({
    threadId,
    workspaceId,
    userWorkspaceId,
    hasPendingQuestion,
    preview,
  }: ThreadContext & {
    hasPendingQuestion: boolean;
    preview?: string;
  }): Promise<void> {
    await this.inboxRouterService.route({
      workspaceId,
      typeKey: hasPendingQuestion
        ? INBOX_ITEM_TYPE_KEY.agentQuestion
        : INBOX_ITEM_TYPE_KEY.conversation,
      preview,
      subject: {
        kind: 'thread',
        threadId,
        ownerUserWorkspaceId: userWorkspaceId,
      },
    });
  }

  async onThreadTitleChanged({
    threadId,
    workspaceId,
    title,
  }: Omit<ThreadContext, 'userWorkspaceId'> & {
    title: string;
  }): Promise<void> {
    await this.inboxRouterService.restateThreadItem({
      workspaceId,
      threadId,
      title,
    });
  }

  // The person answered, so the item stops being a question. Their own answer
  // is not something that happened to them, so it must not resurface the item
  // or mark it unread; the agent's next turn is what does that.
  async onQuestionAnswered({
    threadId,
    workspaceId,
  }: Omit<ThreadContext, 'userWorkspaceId'>): Promise<void> {
    await this.inboxRouterService.restateThreadItem({
      workspaceId,
      threadId,
      typeKey: INBOX_ITEM_TYPE_KEY.conversation,
    });
  }

  async onThreadRemoved({
    threadId,
    workspaceId,
  }: Omit<ThreadContext, 'userWorkspaceId'>): Promise<void> {
    await this.inboxRouterService.clearByThreadId({ workspaceId, threadId });
  }
}
