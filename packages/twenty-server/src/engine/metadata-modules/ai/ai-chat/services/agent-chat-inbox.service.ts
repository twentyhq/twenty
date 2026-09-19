import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { InboxItemPriority } from 'src/engine/core-modules/inbox/enums/inbox-item-priority.enum';
import { InboxRouterService } from 'src/engine/core-modules/inbox/services/inbox-router.service';

const CONVERSATION_ICON = 'IconMessageCircle';
const QUESTION_ICON = 'IconHelpCircle';
const FAILED_ICON = 'IconAlertTriangle';
const DEFAULT_CONVERSATION_TITLE = 'Conversation';

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
      producer: 'agentChat',
      icon: CONVERSATION_ICON,
      priority: InboxItemPriority.UPDATE,
      title: title ?? DEFAULT_CONVERSATION_TITLE,
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
      producer: 'agentChat',
      // The latest turn decides how the item reads: a pending question wants
      // an answer, anything else is news about the conversation.
      icon: hasPendingQuestion ? QUESTION_ICON : CONVERSATION_ICON,
      priority: hasPendingQuestion
        ? InboxItemPriority.NEEDS_ACTION
        : InboxItemPriority.UPDATE,
      ...(isDefined(summary) ? { summary } : {}),
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

  // A failed turn is the only thing that ends a turn without reaching
  // onTurnCompleted, so without this the item keeps whatever the last completed
  // turn left behind: a resume that fails after its answer cleared
  // pendingQuestionMessageId would still read "question from an agent" with no
  // question pending, and an ordinary turn would fail with nothing in the inbox
  // at all. The stream-error event only reaches someone already watching.
  async onTurnFailed({
    threadId,
    workspaceId,
    userWorkspaceId,
    errorMessage,
  }: ThreadContext & { errorMessage?: string }): Promise<void> {
    await this.inboxRouterService.route({
      workspaceId,
      producer: 'agentChat',
      icon: FAILED_ICON,
      priority: InboxItemPriority.NEEDS_ACTION,
      ...(isNonEmptyString(errorMessage) ? { summary: errorMessage } : {}),
      subject: {
        kind: 'thread',
        threadId,
        ownerUserWorkspaceId: userWorkspaceId,
      },
    });
  }

  // Answering a question is deliberately not reported here: the agent's next
  // turn is what says whether one is still pending. Reporting the answer as
  // well would race that turn and read as "no question pending" even when the
  // resume never ran. Between them, onTurnCompleted and onTurnFailed cover
  // every way that turn can end.

  async onThreadRemoved({
    threadId,
    workspaceId,
  }: Omit<ThreadContext, 'userWorkspaceId'>): Promise<void> {
    await this.inboxRouterService.clearByThreadId({ workspaceId, threadId });
  }
}
