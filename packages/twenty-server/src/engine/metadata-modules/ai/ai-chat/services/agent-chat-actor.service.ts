import {
  workspaceAuthContextStorage,
  withWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { Injectable } from '@nestjs/common';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import { RolePermissionsService } from 'src/engine/permissions/role-permissions.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AgentChatSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-sender.type';
import { type AgentChatAuthorizedConversation } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-authorized-conversation.type';
import { resolveAgentChatMessageWorkspaceMemberIdOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-message-workspace-member-id-or-throw.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentChatActorService {
  constructor(
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messages: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threads: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly threadService: AgentChatThreadService,
    private readonly userAuthContextService: UserWorkspaceAuthContextService,
    private readonly settingPermissionsService: SettingPermissionsService,
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  async resolveMessage({
    workspaceId,
    threadId,
    messageId,
    turnId,
  }: {
    workspaceId: string;
    threadId: string;
    messageId?: string;
    turnId?: string;
  }) {
    if (!isDefined(messageId) && !isDefined(turnId)) {
      throw new AiException(
        'Message identity required for execution',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }
    const message = await this.messages.findOne(workspaceId, {
      where: {
        threadId,
        role: AgentMessageRole.USER,
        ...(isDefined(messageId) ? { id: messageId } : { turnId }),
      },
      order: { createdAt: 'ASC', id: 'ASC' },
    });
    if (
      isDefined(messageId) &&
      (!isDefined(message) || (isDefined(turnId) && message.turnId !== turnId))
    ) {
      throw new AiException(
        'Message not found',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }
    const ownerWorkspaceMemberId = await this.loadThreadOwnerWorkspaceMemberId({
      workspaceId,
      threadId,
      message,
    });
    const workspaceMemberId = resolveAgentChatMessageWorkspaceMemberIdOrThrow({
      message,
      ownerWorkspaceMemberId,
    });
    const { userWorkspaceId } =
      await this.userAuthContextService.resolveWorkspaceMember({
        workspaceId,
        workspaceMemberId,
      });
    const sender: AgentChatSender = {
      userWorkspaceId,
      applicationId: message?.senderApplicationId ?? null,
    };
    return { message, sender };
  }

  private async loadThreadOwnerWorkspaceMemberId({
    workspaceId,
    threadId,
    message,
  }: {
    workspaceId: string;
    threadId: string;
    message: Pick<
      AgentMessageWorkspaceEntity,
      'senderWorkspaceMemberId' | 'senderApplicationId'
    > | null;
  }): Promise<string | null> {
    if (isDefined(message?.senderWorkspaceMemberId)) {
      return null;
    }

    if (isDefined(message) && !isDefined(message.senderApplicationId)) {
      return null;
    }

    const thread = await this.threads.findOneOrFail(workspaceId, {
      where: { id: threadId },
    });

    return thread.workspaceMemberId;
  }

  async resolveAuthorizedConversation({
    workspaceId,
    threadId,
    sender,
  }: {
    workspaceId: string;
    threadId: string;
    sender: AgentChatSender;
  }): Promise<AgentChatAuthorizedConversation> {
    const authContext = await this.userAuthContextService.resolve({
      workspaceId,
      ...sender,
    });
    const thread = await withWorkspaceAuthContext(authContext, () =>
      this.threadService.getWritableThread({
        workspaceId,
        threadId,
        workspaceMemberId: authContext.workspaceMemberId,
      }),
    );
    if (isDefined(thread.deletedAt)) {
      throw new AiException(
        'Thread is deleted',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }
    if (
      !(await this.settingPermissionsService.hasPermissionFlag({
        authContext,
        permissionFlag: PermissionFlagType.AI,
      }))
    ) {
      throw new AiException(
        'Chat execution is not permitted',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }
    if (!(await this.hasRole(authContext))) {
      throw new AiException(
        'Chat execution is not permitted',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }
    return { authContext, thread };
  }

  // a member with no role left cannot act in the chat nor run the calls they approve
  async hasRole(authContext: WorkspaceAuthContext): Promise<boolean> {
    return isNonEmptyArray(
      await this.rolePermissionsService.findRoleIds({ authContext }),
    );
  }

  // resolved from the application context of the turn that made the call
  async authorizeToolCallResolution({
    workspaceId,
    threadId,
    messageId,
  }: {
    workspaceId: string;
    threadId: string;
    messageId: string;
  }): Promise<void> {
    const toolCallMessage = await this.messages.findOne(workspaceId, {
      where: { id: messageId, threadId, role: AgentMessageRole.ASSISTANT },
      select: ['turnId'],
    });
    if (!isDefined(toolCallMessage?.turnId)) {
      throw new AiException(
        'Tool call turn not found',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }
    const { sender } = await this.resolveMessage({
      workspaceId,
      threadId,
      turnId: toolCallMessage.turnId,
    });
    const request = workspaceAuthContextStorage.getStore();
    if (
      !isDefined(request) ||
      !isUserAuthContext(request) ||
      request.workspace.id !== workspaceId ||
      (request.application?.id ?? null) !== sender.applicationId
    ) {
      throw new AiException(
        'Resolving this tool call requires the original application context',
        AiExceptionCode.TOOL_CALL_RESOLUTION_FORBIDDEN,
      );
    }
  }

  async authorizeRetry(args: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    userWorkspaceId: string;
  }) {
    const execution = await this.authorizeJob(args);
    const request = workspaceAuthContextStorage.getStore();
    if (
      isDefined(request) &&
      isUserAuthContext(request) &&
      (request.workspace.id !== args.workspaceId ||
        request.userWorkspaceId !== execution.sender.userWorkspaceId ||
        (request.application?.id ?? null) !== execution.sender.applicationId)
    ) {
      throw new AiException(
        'Retry requires the original sender context',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }
    return execution;
  }

  async authorizeJob({
    workspaceId,
    threadId,
    messageId,
    turnId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    threadId: string;
    messageId?: string;
    turnId?: string;
    userWorkspaceId: string;
  }) {
    const { message, sender } = await this.resolveMessage({
      workspaceId,
      threadId,
      messageId,
      turnId,
    });
    if (
      sender.userWorkspaceId !== userWorkspaceId ||
      (isDefined(message) && message.status !== AgentMessageStatus.SENT)
    ) {
      throw new AiException(
        'Message sender does not match execution',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }
    const authorizedConversation = await this.resolveAuthorizedConversation({
      workspaceId,
      threadId,
      sender,
    });
    return { message, sender, authorizedConversation };
  }
}
