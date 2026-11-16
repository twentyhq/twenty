import { Injectable, Logger } from '@nestjs/common';

import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { type SendInboxMessageInput } from 'twenty-shared/application';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-delivery-reason.enum';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentChatInboxDeliveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-delivery.service';
import { AgentChatInboxParticipantWriterService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-inbox-participant-writer.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AgentInboxDelivery } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-delivery.type';
import { type AgentInboxSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-sender.type';
import { resolveEmailToolCallProposal } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-email-tool-call-proposal.util';
import { buildInboxMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-ids.util';
import { buildInboxThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-thread-id.util';
import { buildInboxMessageToolCallPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-tool-call-part.util';
import { buildToolPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-tool-part.util';
import { extractInboxMessageMentionedWorkspaceMemberIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/extract-inbox-message-mentioned-workspace-member-ids.util';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { type ResolveInboxProposal } from 'src/engine/metadata-modules/ai/ai-chat/types/resolve-inbox-proposal.type';
import { getAgentInboxSenderDetails } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-inbox-sender-details.util';
import { isUniqueViolationError } from 'src/engine/workspace-query-executor/utils/is-unique-violation-error.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';

const findNewWorkspaceMemberIds = (
  thread: AgentChatThreadWorkspaceEntity | null,
  workspaceMemberIds: string[],
) =>
  [...new Set(workspaceMemberIds)].filter(
    (workspaceMemberId) =>
      workspaceMemberId !== thread?.workspaceMemberId &&
      !thread?.writerWorkspaceMemberIds?.includes(workspaceMemberId),
  );

@Injectable()
export class AgentInboxService {
  private readonly logger = new Logger(AgentInboxService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    private readonly threadService: AgentChatThreadService,
    private readonly sharingService: AgentChatSharingService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly inboxDeliveryService: AgentChatInboxDeliveryService,
    private readonly inboxParticipantWriterService: AgentChatInboxParticipantWriterService,
  ) {}

  // Every record has an id derived from the keys: the thread key picks the
  // conversation, and the idempotency key the message in it, so a retry or a
  // concurrent send completes the same message instead of writing another.
  // A message is written with its parts at once, so one that exists is done.
  async sendMessage({
    workspaceId,
    sender,
    input,
    buildAwaitingToolCall,
    resolveProposal = async (proposeToolCallInput) =>
      resolveEmailToolCallProposal(proposeToolCallInput),
  }: {
    workspaceId: string;
    sender: AgentInboxSender;
    input: Omit<SendInboxMessageInput, 'toolCall'> & { toolCall?: unknown };
    // without a resolver, only emails can be proposed: they need no tool of the sender's
    resolveProposal?: ResolveInboxProposal;
    // a pausing call the server resolves, with its pending output, only when the message is written,
    // so a message delivered earlier is found even once the call could no longer be resolved
    buildAwaitingToolCall?: (postedCall: {
      threadId: string;
      toolCallId: string;
    }) => Promise<{
      toolName: string;
      input: Record<string, unknown>;
      output: Record<string, unknown>;
    }>;
  }): Promise<AgentInboxDelivery> {
    const senderDetails = getAgentInboxSenderDetails(sender);
    const { threadId, turnId, openingMessageId, messageId, toolCallId } =
      buildInboxMessageIds({
        senderKey: senderDetails.key,
        threadKey: input.threadKey,
        idempotencyKey: input.idempotencyKey,
      });

    const existingThread = await this.findThread({ workspaceId, threadId });

    // A member who deleted the conversation has dismissed it, and a message
    // that exists was already delivered.
    if (isDefined(existingThread?.deletedAt)) {
      return { threadId, toolCallId, isDismissed: true };
    }

    // opened on every send, so members a later send lists join the
    // conversation, even when the message it repeats was already written
    const openThread = () =>
      this.openThread({
        workspaceId,
        sender,
        workspaceMemberIds: input.workspaceMemberIds,
        threadKey: input.threadKey,
        title: input.title,
      });

    if (await this.messageExists({ workspaceId, id: messageId })) {
      await openThread();

      return {
        threadId,
        toolCallId,
        isDismissed: false,
        awaitedToolOutput: isDefined(buildAwaitingToolCall)
          ? await this.findToolOutput({ workspaceId, toolCallId })
          : undefined,
      };
    }

    const awaitingToolCall = await buildAwaitingToolCall?.({
      threadId,
      toolCallId,
    });
    const toolCallPart = isDefined(awaitingToolCall)
      ? {
          part: buildToolPart({ ...awaitingToolCall, toolCallId }),
          isAwaitingAnswer: true,
        }
      : isDefined(input.toolCall)
        ? await buildInboxMessageToolCallPart({
            toolCall: input.toolCall,
            toolCallId,
            resolveProposal,
            findApplicationTool: (logicFunctionUniversalIdentifier) =>
              this.findApplicationTool({
                workspaceId,
                applicationId: senderDetails.applicationId,
                logicFunctionUniversalIdentifier,
              }),
          })
        : undefined;

    const { thread } = await openThread();

    await this.ensureOpener({
      workspaceId,
      threadId,
      turnId,
      openingMessageId,
      senderDescription: senderDetails.description,
    });

    const parts: ExtendedUIMessagePart[] = [{ type: 'text', text: input.text }];

    if (isDefined(toolCallPart)) {
      parts.push(toolCallPart.part);
    }

    const isWritten = await this.ignoreDuplicate(() =>
      this.conversationWriterService.insertMessage({
        workspaceId,
        id: messageId,
        threadId,
        turnId,
        role: AgentMessageRole.ASSISTANT,
        agentId: null,
        senderUserWorkspaceId: null,
        senderApplicationId: senderDetails.applicationId,
        isAwaitingAnswer: toolCallPart?.isAwaitingAnswer,
        parts,
      }),
    );

    if (isWritten) {
      await this.threadService.recordThreadActivity({
        workspaceId,
        threadId,
        text: input.text,
        threadBefore: thread,
      });
      await this.mentionParticipants({
        workspaceId,
        thread,
        messageId,
        workspaceMemberIds: extractInboxMessageMentionedWorkspaceMemberIds(
          input.text,
        ),
      });
    }

    if (!isDefined(awaitingToolCall)) {
      return { threadId, toolCallId, isDismissed: false };
    }

    const awaitedToolOutput = isWritten
      ? awaitingToolCall.output
      : await this.findToolOutput({ workspaceId, toolCallId });

    return { threadId, toolCallId, isDismissed: false, awaitedToolOutput };
  }

  // The thread key picks the sender's conversation: the first member to
  // receive it owns it, and every member listed then or later follows it. A
  // conversation opened with no member belongs to no inbox, and only the
  // server reads it. One a member deleted is returned as it is, and the caller
  // decides whether to write to it.
  async openThread({
    workspaceId,
    sender,
    workspaceMemberIds,
    threadKey,
    title,
    isArchivedOnCreate = false,
  }: {
    workspaceId: string;
    sender: AgentInboxSender;
    workspaceMemberIds: string[];
    threadKey: string;
    title: string;
    isArchivedOnCreate?: boolean;
  }): Promise<{
    thread: AgentChatThreadWorkspaceEntity;
    isCreated: boolean;
  }> {
    const threadId = buildInboxThreadId({
      senderKey: getAgentInboxSenderDetails(sender).key,
      threadKey,
    });
    const existingThread = await this.findThread({ workspaceId, threadId });

    // checked before any write, so a member who cannot use chats fails the open
    // before it creates the conversation or shares it with anyone
    if (!isDefined(existingThread?.deletedAt)) {
      await Promise.all(
        findNewWorkspaceMemberIds(existingThread, workspaceMemberIds).map(
          (workspaceMemberId) =>
            this.sharingService.getAuthContextOrThrow({
              workspaceId,
              workspaceMemberId,
            }),
        ),
      );
    }

    const openedThread = isDefined(existingThread)
      ? { thread: existingThread, isCreated: false }
      : await this.createThread({
          workspaceId,
          threadId,
          ownerWorkspaceMemberId: workspaceMemberIds[0],
          title,
          isArchived: isArchivedOnCreate,
        });

    if (!isDefined(openedThread.thread.deletedAt)) {
      await this.addParticipants({
        workspaceId,
        thread: openedThread.thread,
        workspaceMemberIds,
      });
    }

    return openedThread;
  }

  private async createThread({
    workspaceId,
    threadId,
    ownerWorkspaceMemberId,
    title,
    isArchived,
  }: {
    workspaceId: string;
    threadId: string;
    ownerWorkspaceMemberId: string | undefined;
    title: string;
    isArchived: boolean;
  }): Promise<{ thread: AgentChatThreadWorkspaceEntity; isCreated: boolean }> {
    try {
      const thread = isDefined(ownerWorkspaceMemberId)
        ? await this.threadService.createThread({
            workspaceId,
            workspaceMemberId: ownerWorkspaceMemberId,
            id: threadId,
            title,
            isArchived,
          })
        : await this.createUnaddressedThread({ workspaceId, threadId, title });

      return { thread, isCreated: true };
    } catch (error) {
      const concurrentlyCreatedThread = isUniqueViolationError(error)
        ? await this.findThread({ workspaceId, threadId })
        : null;

      if (!isDefined(concurrentlyCreatedThread)) {
        throw error;
      }

      return { thread: concurrentlyCreatedThread, isCreated: false };
    }
  }

  // Shared by its owner, so a member who cannot have the conversation fails
  // the open like an owner who cannot. A conversation with no owner has no
  // one to share it, and stays out of every inbox.
  private async addParticipants({
    workspaceId,
    thread,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    thread: AgentChatThreadWorkspaceEntity;
    workspaceMemberIds: string[];
  }): Promise<void> {
    const newWorkspaceMemberIds = findNewWorkspaceMemberIds(
      thread,
      workspaceMemberIds,
    );

    if (newWorkspaceMemberIds.length === 0) {
      return;
    }

    if (!isDefined(thread.workspaceMemberId)) {
      return throwAgentChatThreadNotFound();
    }

    const deliveredWorkspaceMemberIds =
      await this.inboxDeliveryService.deliverThreadToMemberInboxes({
        workspaceId,
        threadId: thread.id,
        workspaceMemberId: thread.workspaceMemberId,
        workspaceMemberIds: newWorkspaceMemberIds,
        reason: AgentChatInboxDeliveryReason.RECIPIENT,
      });

    if (deliveredWorkspaceMemberIds.length !== newWorkspaceMemberIds.length) {
      throwAgentChatThreadNotFound();
    }
  }

  private async mentionParticipants({
    workspaceId,
    thread,
    messageId,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    thread: Pick<AgentChatThreadWorkspaceEntity, 'id' | 'workspaceMemberId'>;
    messageId: string;
    workspaceMemberIds: string[];
  }): Promise<void> {
    if (
      !isNonEmptyArray(workspaceMemberIds) ||
      !isDefined(thread.workspaceMemberId)
    ) {
      return;
    }

    const access = {
      workspaceId,
      threadId: thread.id,
      workspaceMemberId: thread.workspaceMemberId,
    };

    try {
      await this.inboxDeliveryService.deliverThreadToMemberInboxes({
        ...access,
        workspaceMemberIds,
        reason: AgentChatInboxDeliveryReason.MENTION,
      });

      if (workspaceMemberIds.includes(thread.workspaceMemberId)) {
        await this.inboxParticipantWriterService.writeParticipantInboxState({
          ...access,
          workspaceMemberIds: [thread.workspaceMemberId],
          reason: AgentChatInboxDeliveryReason.MENTION,
        });
      }
    } catch (error) {
      this.logger.warn(
        doNotTranslate(
          `Could not deliver mentions for inbox message ${messageId} in thread ${thread.id} of workspace ${workspaceId}: ${formatErrorWithCause(error)}`,
        ),
      );
    }
  }

  private async findToolOutput({
    workspaceId,
    toolCallId,
  }: {
    workspaceId: string;
    toolCallId: string;
  }): Promise<unknown> {
    const part = await this.messagePartRepository.findOne(workspaceId, {
      where: { toolCallId },
      select: ['toolOutput'],
    });

    return part?.toolOutput;
  }

  // The opener is a system message naming the sender, and holds no text from
  // it. Written as two idempotent writes, so a retry completes an opener that
  // a failure left half written.
  private async ensureOpener({
    workspaceId,
    threadId,
    turnId,
    openingMessageId,
    senderDescription,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    openingMessageId: string;
    senderDescription: string;
  }): Promise<void> {
    await this.ignoreDuplicate(() =>
      this.conversationWriterService.insertTurn({
        workspaceId,
        id: turnId,
        threadId,
        agentId: null,
        status: AgentTurnStatus.COMPLETED,
      }),
    );

    await this.ignoreDuplicate(() =>
      this.conversationWriterService.insertMessage({
        workspaceId,
        id: openingMessageId,
        threadId,
        turnId,
        role: AgentMessageRole.SYSTEM,
        agentId: null,
        senderUserWorkspaceId: null,
        parts: [
          {
            type: 'text',
            text: `${senderDescription} started this conversation. Its messages follow.`,
          },
        ],
      }),
    );
  }

  private findThread({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }) {
    return this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });
  }

  private async createUnaddressedThread({
    workspaceId,
    threadId,
    title,
  }: {
    workspaceId: string;
    threadId: string;
    title: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    await this.threadRepository.query(workspaceId, ({ manager, table }) =>
      manager.query(
        `INSERT INTO ${table('agentChatThread')} (id, title, "${IS_PRIVATE_COLUMN_NAME}") VALUES ($1, $2, true)`,
        [threadId, title],
      ),
    );

    return this.threadRepository.findOneOrFail(workspaceId, {
      where: { id: threadId },
    });
  }

  // Every id is derived from the keys, so a row that already exists was
  // written by a concurrent send of the same conversation.
  private async ignoreDuplicate(write: () => Promise<unknown>) {
    try {
      await write();

      return true;
    } catch (error) {
      if (isUniqueViolationError(error)) {
        return false;
      }

      throw error;
    }
  }

  private async messageExists({
    workspaceId,
    id,
  }: {
    workspaceId: string;
    id: string;
  }): Promise<boolean> {
    return isDefined(
      await this.messageRepository.findOne(workspaceId, {
        where: { id },
        select: ['id'],
      }),
    );
  }

  private async findApplicationTool({
    workspaceId,
    applicationId,
    logicFunctionUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationId: string | null;
    logicFunctionUniversalIdentifier: string;
  }): Promise<FlatLogicFunction | undefined> {
    if (!isDefined(applicationId)) {
      return undefined;
    }

    const { flatLogicFunctionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
      ]);
    const logicFunction =
      flatLogicFunctionMaps.byUniversalIdentifier[
        logicFunctionUniversalIdentifier
      ];

    return logicFunction?.applicationId === applicationId &&
      !isDefined(logicFunction.deletedAt)
      ? logicFunction
      : undefined;
  }
}
