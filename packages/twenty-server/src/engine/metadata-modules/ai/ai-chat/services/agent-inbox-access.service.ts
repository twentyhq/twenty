import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AgentInboxCallerAuthContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-caller-auth-context.type';
import { isAgentChatThreadReachedByRole } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-thread-reached-by-role.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ApplicationThreadAccessArgs = {
  workspaceId: string;
  application: Pick<FlatApplication, 'id' | 'defaultRoleId'>;
};

@Injectable()
export class AgentInboxAccessService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    private readonly threadService: AgentChatThreadService,
    private readonly sharingService: AgentChatSharingService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async getWritableThread({
    authContext,
    threadId,
  }: {
    authContext: AgentInboxCallerAuthContext;
    threadId: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const workspaceId = authContext.workspace.id;

    if (isUserAuthContext(authContext)) {
      return this.threadService.getWritableThread({
        workspaceId,
        workspaceMemberId: authContext.workspaceMemberId,
        threadId,
      });
    }

    const thread = await this.getThreadOrThrow({ workspaceId, threadId });

    await this.assertApplicationCanWriteThreadOrThrow({
      workspaceId,
      application: authContext.application,
      thread,
    });

    return thread;
  }

  async getThreadOrThrow({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<AgentChatThreadWorkspaceEntity> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    return thread ?? throwAgentChatThreadNotFound();
  }

  async assertApplicationCanWriteThreadOrThrow({
    thread,
    ...applicationArgs
  }: ApplicationThreadAccessArgs & {
    thread: Pick<AgentChatThreadWorkspaceEntity, 'id' | 'channelId'>;
  }): Promise<void> {
    const canApplicationWriteThread =
      (await this.isThreadReachedByApplicationRole({
        ...applicationArgs,
        thread,
      })) ||
      (await this.doesApplicationParticipateInThread({
        ...applicationArgs,
        threadId: thread.id,
      }));

    if (!canApplicationWriteThread) {
      throwAgentChatThreadNotFound();
    }
  }

  async assertApplicationParticipatesInThreadOrThrow(
    args: ApplicationThreadAccessArgs & { threadId: string },
  ): Promise<void> {
    if (!(await this.doesApplicationParticipateInThread(args))) {
      throwAgentChatThreadNotFound();
    }
  }

  private doesApplicationParticipateInThread({
    workspaceId,
    application,
    threadId,
  }: ApplicationThreadAccessArgs & { threadId: string }): Promise<boolean> {
    return this.messageRepository.existsBy(workspaceId, {
      threadId,
      senderApplicationId: application.id,
    });
  }

  private async isThreadReachedByApplicationRole({
    workspaceId,
    application,
    thread,
  }: ApplicationThreadAccessArgs & {
    thread: Pick<AgentChatThreadWorkspaceEntity, 'id' | 'channelId'>;
  }): Promise<boolean> {
    if (!isDefined(application.defaultRoleId)) {
      return false;
    }

    const { flatRoleMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatRoleMaps'],
    );
    const applicationRole = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: application.defaultRoleId,
      flatEntityMaps: flatRoleMaps,
    });

    if (!isDefined(applicationRole)) {
      return false;
    }

    const threadShares = await this.recordShareStorageService.findByRecordIds({
      workspaceId,
      objectMetadataId:
        await this.sharingService.getThreadObjectMetadataId(workspaceId),
      recordIds: [thread.id],
    });

    return isAgentChatThreadReachedByRole({
      role: applicationRole,
      thread,
      threadShares,
    });
  }
}
