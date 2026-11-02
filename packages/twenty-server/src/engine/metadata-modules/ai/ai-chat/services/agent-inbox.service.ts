import { Injectable } from '@nestjs/common';

import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentChatThreadTargetService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-target.service';
import { AgentInboxAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox-access.service';
import { type AgentInboxCallerAuthContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-caller-auth-context.type';
import { type AgentInboxDelivery } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-delivery.type';
import { type AgentInboxSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-sender.type';
import { type NormalizedSendInboxMessageInput } from 'src/engine/metadata-modules/ai/ai-chat/types/normalized-send-inbox-message-input.type';
import { resolveEmailToolCallProposal } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-email-tool-call-proposal.util';
import { buildInboxThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-thread-id.util';
import { buildSendInboxMessageIds } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-send-inbox-message-ids.util';
import { buildInboxMessageToolCallPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-inbox-message-tool-call-part.util';
import { buildToolPart } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-tool-part.util';
import { type ResolveInboxProposal } from 'src/engine/metadata-modules/ai/ai-chat/types/resolve-inbox-proposal.type';
import { getAgentInboxSenderDetails } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-inbox-sender-details.util';
import { isUniqueViolationError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-unique-violation-error.util';
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

type OpenedThread = {
  thread: AgentChatThreadWorkspaceEntity;
  isCreated: boolean;
};

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
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    private readonly threadService: AgentChatThreadService,
    private readonly sharingService: AgentChatSharingService,
    private readonly channelAccessService: AgentChatChannelAccessService,
    private readonly inboxAccessService: AgentInboxAccessService,
    private readonly threadTargetService: AgentChatThreadTargetService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  // Ids derive from the keys, so a retry or a concurrent send completes the same message instead of writing another
  async sendMessage({
    workspaceId,
    sender,
    input,
    authContext,
    buildAwaitingToolCall,
    resolveProposal = async (proposeToolCallInput) =>
      resolveEmailToolCallProposal(proposeToolCallInput),
  }: {
    workspaceId: string;
    sender: AgentInboxSender;
    input: NormalizedSendInboxMessageInput;
    authContext?: AgentInboxCallerAuthContext;
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
    const { addressing } = input;
    const { threadId, turnId, messageId, toolCallId, openingMessageId } =
      buildSendInboxMessageIds({
        addressing,
        senderKey: senderDetails.key,
        idempotencyKey: input.idempotencyKey,
      });

    if ('threadId' in addressing) {
      await this.inboxAccessService.assertThreadIsWritableOrThrow({
        authContext: authContext ?? throwAgentChatThreadNotFound(),
        threadId,
      });
    }

    const existingThread = await this.findThread({ workspaceId, threadId });

    // A member who deleted the conversation has dismissed it, and a message
    // that exists was already delivered.
    if (isDefined(existingThread?.deletedAt)) {
      return {
        threadId,
        messageId,
        toolCallId,
        isNewThread: false,
        isDismissed: true,
      };
    }

    if (await this.messageExists({ workspaceId, id: messageId })) {
      await this.openOrJoinThread({ workspaceId, sender, input });

      return {
        threadId,
        messageId,
        toolCallId,
        isNewThread: false,
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

    await this.assertRecordTargetsAreReadableOrThrow({
      workspaceId,
      recordTargets: input.recordTargets,
      authContext,
    });

    const { thread, isCreated } = await this.openOrJoinThread({
      workspaceId,
      sender,
      input,
    });

    if (
      isNonEmptyArray(input.mentionedWorkspaceMemberIds) &&
      !isDefined(thread.workspaceMemberId)
    ) {
      throwAgentChatThreadNotFound();
    }

    await this.attachRecordTargets({
      workspaceId,
      threadId,
      recordTargets: input.recordTargets,
      authContext,
    });

    await this.ensureTurn({ workspaceId, threadId, turnId });

    if (isDefined(openingMessageId)) {
      await this.ensureOpener({
        workspaceId,
        threadId,
        turnId,
        openingMessageId,
        senderDescription: senderDetails.description,
      });
    }

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
        workspaceMemberIds: input.mentionedWorkspaceMemberIds,
      });
    }

    const delivery = {
      threadId,
      messageId,
      toolCallId,
      isNewThread: isCreated,
      isDismissed: false,
    };

    if (!isDefined(awaitingToolCall)) {
      return delivery;
    }

    return {
      ...delivery,
      awaitedToolOutput: isWritten
        ? awaitingToolCall.output
        : await this.findToolOutput({ workspaceId, toolCallId }),
    };
  }

  // Opened on every send, so members a later send lists join even when the message already exists
  private async openOrJoinThread({
    workspaceId,
    sender,
    input,
  }: {
    workspaceId: string;
    sender: AgentInboxSender;
    input: NormalizedSendInboxMessageInput;
  }): Promise<OpenedThread> {
    const { addressing } = input;

    if ('threadKey' in addressing) {
      return this.openThread({
        workspaceId,
        sender,
        workspaceMemberIds: input.workspaceMemberIds,
        threadKey: addressing.threadKey,
        title: addressing.title,
        channelId: addressing.channelId,
      });
    }

    return this.joinThread({
      workspaceId,
      threadId: addressing.threadId,
      workspaceMemberIds: input.workspaceMemberIds,
    });
  }

  // The first member to receive the keyed conversation owns it; with no member, only channel roles or the server read it
  async openThread({
    workspaceId,
    sender,
    workspaceMemberIds,
    threadKey,
    title,
    channelId,
    isArchivedOnCreate = false,
  }: {
    workspaceId: string;
    sender: AgentInboxSender;
    workspaceMemberIds: string[];
    threadKey: string;
    title: string;
    channelId?: string;
    isArchivedOnCreate?: boolean;
  }): Promise<OpenedThread> {
    const senderDetails = getAgentInboxSenderDetails(sender);
    const threadId = buildInboxThreadId({
      senderKey: senderDetails.key,
      threadKey,
    });
    const existingThread = await this.findThread({ workspaceId, threadId });

    // checked before any write, so a member who cannot use chats fails the open
    // before it creates the conversation or shares it with anyone
    if (!isDefined(existingThread?.deletedAt)) {
      await Promise.all(
        findNewWorkspaceMemberIds(existingThread, workspaceMemberIds).map(
          (workspaceMemberId) =>
            this.sharingService.getAuthContext({
              workspaceId,
              workspaceMemberId,
            }),
        ),
      );
    }

    if (!isDefined(existingThread) && isDefined(channelId)) {
      await this.channelAccessService.assertChannelOpenToRole({
        workspaceId,
        channelId,
        roleId: senderDetails.roleId,
      });
    }

    const openedThread = isDefined(existingThread)
      ? { thread: existingThread, isCreated: false }
      : await this.createThread({
          workspaceId,
          threadId,
          ownerWorkspaceMemberId: workspaceMemberIds[0],
          title,
          channelId,
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

  // The caller's access to it was checked, and the sender did not open it
  private async joinThread({
    workspaceId,
    threadId,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    threadId: string;
    workspaceMemberIds: string[];
  }): Promise<OpenedThread> {
    const thread =
      (await this.findThread({ workspaceId, threadId })) ??
      throwAgentChatThreadNotFound();

    if (!isDefined(thread.deletedAt)) {
      await this.addParticipants({ workspaceId, thread, workspaceMemberIds });
    }

    return { thread, isCreated: false };
  }

  private async createThread({
    workspaceId,
    threadId,
    ownerWorkspaceMemberId,
    title,
    channelId,
    isArchived,
  }: {
    workspaceId: string;
    threadId: string;
    ownerWorkspaceMemberId: string | undefined;
    title: string;
    channelId: string | undefined;
    isArchived: boolean;
  }): Promise<OpenedThread> {
    try {
      const thread = await this.insertThread({
        workspaceId,
        threadId,
        ownerWorkspaceMemberId,
        title,
        channelId,
        isArchived,
      });

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

  private insertThread({
    workspaceId,
    threadId,
    ownerWorkspaceMemberId,
    title,
    channelId,
    isArchived,
  }: {
    workspaceId: string;
    threadId: string;
    ownerWorkspaceMemberId: string | undefined;
    title: string;
    channelId: string | undefined;
    isArchived: boolean;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    if (isDefined(ownerWorkspaceMemberId)) {
      return this.threadService.createThread({
        workspaceId,
        workspaceMemberId: ownerWorkspaceMemberId,
        id: threadId,
        title,
        isArchived,
        channelId,
      });
    }

    if (isDefined(channelId)) {
      return this.threadService.createUnownedChannelThread({
        workspaceId,
        id: threadId,
        title,
        channelId,
      });
    }

    return this.createUnaddressedThread({ workspaceId, threadId, title });
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

    const participantWorkspaceMemberIds =
      await this.threadService.deliverToParticipants({
        workspaceId,
        threadId: thread.id,
        workspaceMemberId: thread.workspaceMemberId,
        participantWorkspaceMemberIds: newWorkspaceMemberIds,
      });

    if (participantWorkspaceMemberIds.length !== newWorkspaceMemberIds.length) {
      throwAgentChatThreadNotFound();
    }
  }

  // Mentioned once the message is written, so a message sent again creates no new obligation
  private async mentionParticipants({
    workspaceId,
    thread,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    thread: AgentChatThreadWorkspaceEntity;
    workspaceMemberIds: string[];
  }): Promise<void> {
    if (workspaceMemberIds.length === 0) {
      return;
    }

    await this.threadService.mentionParticipants({
      workspaceId,
      threadId: thread.id,
      workspaceMemberId:
        thread.workspaceMemberId ?? throwAgentChatThreadNotFound(),
      participantWorkspaceMemberIds: workspaceMemberIds,
    });
  }

  private async assertRecordTargetsAreReadableOrThrow({
    workspaceId,
    recordTargets,
    authContext,
  }: {
    workspaceId: string;
    recordTargets: NormalizedSendInboxMessageInput['recordTargets'];
    authContext: AgentInboxCallerAuthContext | undefined;
  }): Promise<void> {
    for (const recordTarget of recordTargets) {
      await this.threadTargetService.assertRecordTargetIsReadableOrThrow({
        workspaceId,
        authContext: authContext ?? throwAgentChatThreadNotFound(),
        ...recordTarget,
      });
    }
  }

  private async attachRecordTargets({
    workspaceId,
    threadId,
    recordTargets,
    authContext,
  }: {
    workspaceId: string;
    threadId: string;
    recordTargets: NormalizedSendInboxMessageInput['recordTargets'];
    authContext: AgentInboxCallerAuthContext | undefined;
  }): Promise<void> {
    for (const recordTarget of recordTargets) {
      await this.threadTargetService.attachThreadToRecord({
        workspaceId,
        threadId,
        authContext: authContext ?? throwAgentChatThreadNotFound(),
        ...recordTarget,
      });
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

  // Idempotent, so a retry completes a turn that a failure left unwritten
  private async ensureTurn({
    workspaceId,
    threadId,
    turnId,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
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
  }

  // Only the conversation the sender keyed gets an opener: an existing one was started by someone else
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
    const { privateColumn, privateValue } =
      await this.sharingService.getPrivateRecordInsertSql(workspaceId);

    await this.threadRepository.query(workspaceId, ({ manager, table }) =>
      manager.query(
        `INSERT INTO ${table('agentChatThread')} (id, title${privateColumn}) VALUES ($1, $2${privateValue})`,
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
