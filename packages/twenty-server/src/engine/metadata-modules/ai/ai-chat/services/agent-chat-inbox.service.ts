import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { INBOX_ITEM_TYPE_KEY } from 'src/engine/core-modules/inbox/constants/standard-inbox-item-types.constant';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';

type ThreadContext = {
  threadId: string;
  workspaceId: string;
  userWorkspaceId: string;
};

// A thread has exactly one item per owner for its whole life, so these calls
// fold into it rather than stacking up.
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

  async onTurnCompleted({
    threadId,
    workspaceId,
    userWorkspaceId,
    hasPendingQuestion,
    summary,
  }: ThreadContext & {
    hasPendingQuestion: boolean;
    summary?: string;
  }): Promise<void> {
    await this.inboxRouterService.route({
      workspaceId,
      typeKey: hasPendingQuestion
        ? INBOX_ITEM_TYPE_KEY.agentQuestion
        : INBOX_ITEM_TYPE_KEY.conversation,
      ...(isDefined(summary) ? { context: { summary } } : {}),
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
    await this.inboxRouterService.renameThreadItem({
      workspaceId,
      threadId,
      title,
    });
  }

  // Answering a question is deliberately not reported here: the agent's next
  // turn is what says whether one is still pending. Reporting the answer as
  // well would race that turn and read as "no question pending" even when the
  // resume never ran.

  async onThreadRemoved({
    threadId,
    workspaceId,
  }: Omit<ThreadContext, 'userWorkspaceId'>): Promise<void> {
    await this.inboxRouterService.clearByThreadId({ workspaceId, threadId });
  }
}
