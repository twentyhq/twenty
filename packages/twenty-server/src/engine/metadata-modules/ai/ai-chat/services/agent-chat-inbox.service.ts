import { Injectable, Logger } from '@nestjs/common';

import { INBOX_ITEM_TYPE_KEY } from 'src/engine/core-modules/inbox/constants/standard-inbox-item-types.constant';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';
import { reportToInbox } from 'src/engine/core-modules/inbox/utils/report-to-inbox.util';

type ThreadContext = {
  threadId: string;
  workspaceId: string;
  userWorkspaceId: string;
};

// Turns chat thread events into inbox items. A thread has exactly one item per
// owner for its whole life: these calls fold into it rather than stacking up.
@Injectable()
export class AgentChatInboxService {
  private readonly logger = new Logger(AgentChatInboxService.name);

  constructor(private readonly inboxRouterService: InboxRouterService) {}

  async onThreadCreated({
    threadId,
    workspaceId,
    userWorkspaceId,
    title,
  }: ThreadContext & { title?: string }): Promise<void> {
    await reportToInbox(this.logger, `new thread ${threadId}`, () =>
      this.inboxRouterService.route({
        workspaceId,
        typeKey: INBOX_ITEM_TYPE_KEY.conversation,
        title,
        subject: {
          kind: 'thread',
          threadId,
          ownerUserWorkspaceId: userWorkspaceId,
        },
      }),
    );
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
    await reportToInbox(
      this.logger,
      `completed turn on thread ${threadId}`,
      () =>
        this.inboxRouterService.route({
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
        }),
    );
  }

  async onThreadTitleChanged({
    threadId,
    workspaceId,
    title,
  }: Omit<ThreadContext, 'userWorkspaceId'> & {
    title: string;
  }): Promise<void> {
    await reportToInbox(this.logger, `renamed thread ${threadId}`, () =>
      this.inboxRouterService.renameThreadItem({
        workspaceId,
        threadId,
        title,
      }),
    );
  }

  // Answering a question is deliberately not reported here. The agent's next
  // turn is what says whether one is still pending, and it says so with an
  // event behind it. Reporting the answer as well would be a blind overwrite
  // racing that turn, and it would read as "no question pending" even when the
  // resume never ran.

  async onThreadRemoved({
    threadId,
    workspaceId,
  }: Omit<ThreadContext, 'userWorkspaceId'>): Promise<void> {
    await reportToInbox(this.logger, `removed thread ${threadId}`, () =>
      this.inboxRouterService.clearByThreadId({ workspaceId, threadId }),
    );
  }
}
