import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AGENT_CHAT_CHANNEL_GRANTS_REWRITE_JOB_OPTIONS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-channel-grants-rewrite-job-options.constant';
import { REWRITE_AGENT_CHAT_CHANNEL_GRANTS_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/rewrite-agent-chat-channel-grants-job-name.constant';
import { type RewriteAgentChatChannelGrantsJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/rewrite-agent-chat-channel-grants-job.types';
import { acquireAgentChatChannelGrantLocksForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks-for-thread-write-or-throw.util';
import { acquireAgentChatChannelGrantLocks } from 'src/engine/metadata-modules/ai/ai-chat/utils/acquire-agent-chat-channel-grant-locks.util';
import { replaceAgentChatChannelRuleGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/replace-agent-chat-channel-rule-grants.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

// A chat's only RULE grants, so each rewrite owns every RULE grant in its scope
@Injectable()
export class AgentChatChannelGrantService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly workspaceQueueService: MessageQueueService,
  ) {}

  async enqueueChannelGrantsRewrite(
    data: RewriteAgentChatChannelGrantsJobData,
  ): Promise<void> {
    await this.workspaceQueueService.add<RewriteAgentChatChannelGrantsJobData>(
      REWRITE_AGENT_CHAT_CHANNEL_GRANTS_JOB_NAME,
      data,
      AGENT_CHAT_CHANNEL_GRANTS_REWRITE_JOB_OPTIONS,
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
    await this.threadRepository.query(workspaceId, async ({ manager }) => {
      await acquireAgentChatChannelGrantLocks({
        manager,
        workspaceId,
        channelIds: [channelId],
        mode: 'exclusive',
      });

      await replaceAgentChatChannelRuleGrants({
        manager,
        workspaceId,
        scope: { channelIds: [channelId] },
      });
    });
  }

  async rewriteAllChannelGrants({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<void> {
    const channels = await this.threadRepository.query(
      workspaceId,
      ({ manager }) =>
        manager.query<{ id: string }[]>(
          `SELECT id FROM core."agentChatChannel" WHERE "workspaceId" = $1 ORDER BY id`,
          [workspaceId],
        ),
    );

    for (const { id: channelId } of channels) {
      await this.rewriteChannelGrants({ workspaceId, channelId });
    }
  }
}
