import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
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
import { buildAgentChatChannelAccessQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-access-query.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type AgentChatChannelGrantScope =
  | { threadIds: string[] }
  | { channelId: string };

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

    await this.replaceGrantsInTransaction({
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

      await this.replaceGrantsInTransaction({
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

  private async replaceGrantsInTransaction({
    manager,
    workspaceId,
    scope,
  }: {
    manager: EntityManager;
    workspaceId: string;
    scope: AgentChatChannelGrantScope;
  }): Promise<void> {
    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const isThreadScope = 'threadIds' in scope;
    const threadScopeCondition = isThreadScope
      ? 'thread.id = ANY($3::uuid[])'
      : 'thread."channelId" = $3::uuid';
    const recordShareScopeCondition = isThreadScope
      ? 'record_share."recordId" = ANY($3::uuid[])'
      : 'record_share."sourceId" = $3::uuid';
    const channelAccessQuery = buildAgentChatChannelAccessQuery({
      workspaceIdParameter: '$1',
    });
    const parameters = [
      workspaceId,
      STANDARD_OBJECTS.agentChatThread.universalIdentifier,
      isThreadScope ? scope.threadIds : scope.channelId,
    ];

    await manager.query(
      `DELETE FROM ${schema}."recordShare" record_share
       USING core."objectMetadata" thread_object
       WHERE thread_object."workspaceId" = $1
         AND thread_object."universalIdentifier" = $2
         AND record_share."objectMetadataId" = thread_object.id
         AND record_share."rowCause" = 'RULE'
         AND ${recordShareScopeCondition}
         AND NOT EXISTS (
           SELECT 1
           FROM ${schema}."agentChatThread" thread
           JOIN (${channelAccessQuery}) channel_access
             ON channel_access.channel_id = thread."channelId"
           WHERE ${threadScopeCondition}
             AND thread.id = record_share."recordId"
             AND thread."channelId" = record_share."sourceId"
             AND channel_access.role_id = record_share."principalId"
             AND record_share."deletedAt" IS NULL
         )`,
      parameters,
    );

    await manager.query(
      `INSERT INTO ${schema}."recordShare"
         ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
       SELECT thread_object.id, thread.id, channel_access.role_id, 'ROLE', 'READ_WRITE', 'RULE', thread."channelId"
       FROM ${schema}."agentChatThread" thread
       JOIN (${channelAccessQuery}) channel_access
         ON channel_access.channel_id = thread."channelId"
       JOIN core."objectMetadata" thread_object
         ON thread_object."workspaceId" = $1
         AND thread_object."universalIdentifier" = $2
       WHERE ${threadScopeCondition}
       ON CONFLICT DO NOTHING`,
      parameters,
    );
  }
}
