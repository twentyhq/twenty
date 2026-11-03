import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { isNonEmptyArray } from 'twenty-shared/utils';
import { DataSource, type EntityManager } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { AGENT_CHAT_CHANNEL_GRANTS_REWRITE_JOB_OPTIONS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-channel-grants-rewrite-job-options.constant';
import { REWRITE_AGENT_CHAT_CHANNEL_GRANTS_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/rewrite-agent-chat-channel-grants-job-name.constant';
import { type RewriteAgentChatChannelGrantsJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/rewrite-agent-chat-channel-grants-job.types';
import { acquireAgentChatChannelGrantLocksForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks-for-thread-write-or-throw.util';
import { acquireAgentChatChannelGrantLocks } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks.util';
import { replaceAgentChatChannelRuleGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/replace-agent-chat-channel-rule-grants.util';

// A chat's only RULE grants, so each rewrite owns every RULE grant in its scope
@Injectable()
export class AgentChatChannelGrantService {
  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly workspaceQueueService: MessageQueueService,
  ) {}

  async enqueueChannelGrantsRewrite(
    data: RewriteAgentChatChannelGrantsJobData,
  ): Promise<void> {
    await this.workspaceQueueService.add<RewriteAgentChatChannelGrantsJobData>(
      REWRITE_AGENT_CHAT_CHANNEL_GRANTS_JOB_NAME,
      data,
      {
        ...AGENT_CHAT_CHANNEL_GRANTS_REWRITE_JOB_OPTIONS,
        workspaceId: data.workspaceId,
        isWorkspaceJob: true,
      },
    );
  }

  async rewriteThreadGrantsInTransaction({
    manager,
    workspaceId,
    threadIds,
    affectedChannelIds,
  }: {
    manager: EntityManager;
    workspaceId: string;
    threadIds: string[];
    affectedChannelIds: (string | null | undefined)[];
  }): Promise<void> {
    if (!isNonEmptyArray(threadIds)) {
      return;
    }

    await acquireAgentChatChannelGrantLocksForThreadWriteOrThrow({
      manager,
      workspaceId,
      channelIds: affectedChannelIds,
    });

    await replaceAgentChatChannelRuleGrants({
      manager,
      workspaceId,
      scope: { threadIds },
    });
  }

  async rewriteChannelGrants({
    workspaceId,
    channelId,
  }: {
    workspaceId: string;
    channelId: string;
  }): Promise<void> {
    await this.coreDataSource.transaction(async (manager) => {
      await acquireAgentChatChannelGrantLocks({
        manager,
        workspaceId,
        channelIds: [channelId],
        mode: 'exclusive',
      });

      await replaceAgentChatChannelRuleGrants({
        manager,
        workspaceId,
        scope: { channelId },
      });
    });
  }

  async rewriteAllChannelGrants({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const channels = await this.coreDataSource
      .getRepository(AgentChatChannelEntity)
      .find({
        select: { id: true },
        where: { workspaceId },
        order: { id: 'ASC' },
      });

    for (const { id: channelId } of channels) {
      await this.rewriteChannelGrants({ workspaceId, channelId });
    }
  }
}
