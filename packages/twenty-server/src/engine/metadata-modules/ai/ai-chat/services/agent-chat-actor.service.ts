import {
  workspaceAuthContextStorage,
  withWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { Injectable } from '@nestjs/common';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import {
  AgentMessageEntity,
  AgentMessageRole,
  AgentMessageStatus,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { resolveRolePermissionConfig } from 'src/engine/twenty-orm/utils/resolve-role-permission-config.util';
import { type AgentChatSender } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-sender.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentChatActorService {
  constructor(
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messages: AgentHistoryRepository<AgentMessageEntity>,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threads: AgentHistoryRepository<AgentChatThreadEntity>,
    private readonly chatService: AgentChatService,
    private readonly userAuthContextService: UserWorkspaceAuthContextService,
    private readonly permissionsService: PermissionsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
      !isDefined(message) ||
      (isDefined(turnId) && message.turnId !== turnId)
    ) {
      throw new AiException(
        'Message not found',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }
    // Only pre-attribution messages inherit the original participant. Never use
    // a worker's caller or the participant whose preceding turn drained the queue.
    const userWorkspaceId =
      message.senderUserWorkspaceId ??
      (
        await this.threads.findOneOrFail(workspaceId, {
          where: { id: threadId },
        })
      ).userWorkspaceId;
    const sender: AgentChatSender = {
      userWorkspaceId,
      applicationId: message.senderApplicationId ?? null,
    };
    return { message, sender };
  }

  async authorize({
    workspaceId,
    threadId,
    sender,
  }: {
    workspaceId: string;
    threadId: string;
    sender: AgentChatSender;
  }) {
    const authContext = await this.userAuthContextService.resolve({
      workspaceId,
      ...sender,
    });
    const thread = await withWorkspaceAuthContext(authContext, () =>
      this.chatService.getThreadById({
        workspaceId,
        threadId,
        userWorkspaceId: sender.userWorkspaceId,
      }),
    );
    if (isDefined(thread.deletedAt)) {
      throw new AiException(
        'Thread is archived',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }
    if (
      !(await this.permissionsService.userHasWorkspaceSettingPermission({
        workspaceId,
        userWorkspaceId: sender.userWorkspaceId,
        applicationId: sender.applicationId ?? undefined,
        setting: PermissionFlagType.AI,
      }))
    ) {
      throw new AiException(
        'Chat execution is not permitted',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }
    const { userWorkspaceRoleMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userWorkspaceRoleMap',
      ]);
    const rolePermissionConfig = resolveRolePermissionConfig({
      authContext,
      userWorkspaceRoleMap,
      apiKeyRoleMap: {},
    });
    const roleId = userWorkspaceRoleMap[sender.userWorkspaceId];
    if (!isDefined(rolePermissionConfig) || !isDefined(roleId)) {
      throw new AiException(
        'Chat execution is not permitted',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }
    return { authContext, rolePermissionConfig, roleId };
  }

  async authorizeQuestionAnswer({
    workspaceId,
    threadId,
    messageId,
  }: {
    workspaceId: string;
    threadId: string;
    messageId: string;
  }): Promise<void> {
    const question = await this.messages.findOne(workspaceId, {
      where: { id: messageId, threadId, role: AgentMessageRole.ASSISTANT },
      select: ['turnId'],
    });
    if (!isDefined(question?.turnId)) {
      throw new AiException(
        'Question turn not found',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }
    const { sender } = await this.resolveMessage({
      workspaceId,
      threadId,
      turnId: question.turnId,
    });
    const request = workspaceAuthContextStorage.getStore();
    if (
      !isDefined(request) ||
      !isUserAuthContext(request) ||
      request.workspace.id !== workspaceId ||
      (request.application?.id ?? null) !== sender.applicationId
    ) {
      throw new AiException(
        'Answer requires the original application context',
        AiExceptionCode.INVALID_QUESTION_ANSWER,
      );
    }
  }

  async authorizeRetry(args: {
    workspaceId: string;
    threadId: string;
    messageId: string;
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
      message.status !== AgentMessageStatus.SENT
    ) {
      throw new AiException(
        'Message sender does not match execution',
        AiExceptionCode.MESSAGE_NOT_FOUND,
      );
    }
    const authorization = await this.authorize({
      workspaceId,
      threadId,
      sender,
    });
    return { message, sender, authorization };
  }
}
