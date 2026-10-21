import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { AgentChatChannelMetadataService } from 'src/engine/metadata-modules/agent-chat-channel/services/agent-chat-channel-metadata.service';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type GrantScope =
  | { threadIds: string[]; channelIds?: never }
  | { channelIds: string[]; threadIds?: never };

// A chat's only RULE grants, so each rewrite deletes every RULE grant in its scope
@Injectable()
export class AgentChatChannelGrantService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly channelMetadataService: AgentChatChannelMetadataService,
  ) {}

  async rewriteGrants({
    workspaceId,
    ...scope
  }: GrantScope & { workspaceId: string }): Promise<void> {
    await this.threadRepository.query(workspaceId, ({ manager }) =>
      this.rewriteGrantsInTransaction({ manager, workspaceId, ...scope }),
    );
  }

  async rewriteGrantsInTransaction({
    manager,
    workspaceId,
    threadIds,
    channelIds,
  }: GrantScope & {
    manager: EntityManager;
    workspaceId: string;
  }): Promise<void> {
    const scopeIds = threadIds ?? channelIds;

    if (!isNonEmptyArray(scopeIds)) {
      return;
    }

    const schema = escapeIdentifier(getWorkspaceSchemaName(workspaceId));
    const { flatObjectMetadataMaps, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatRoleMaps',
      ]);
    const threadObjectMetadataId = (
      findAgentChatFlatObjectMetadata(
        flatObjectMetadataMaps,
        'agentChatThread',
      ) ?? throwAgentChatThreadNotFound()
    ).id;
    const channels =
      await this.channelMetadataService.findChannels(workspaceId);

    const allChannelsRoleIds = Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((role) => role.canAccessAllAgentChatChannels)
      .map(({ id }) => id);

    const roleGrants = channels.flatMap(({ id, roleIds }) =>
      [...new Set([...roleIds, ...allChannelsRoleIds])].map((roleId) => ({
        channelId: id,
        roleId,
      })),
    );

    const scopeCondition = isNonEmptyArray(threadIds)
      ? `thread.id = ANY($2::uuid[])`
      : `thread."channelId" = ANY($2::uuid[])`;

    await manager.query(
      `DELETE FROM ${schema}."recordShare"
       WHERE "objectMetadataId" = $1 AND "rowCause" = 'RULE'
         AND ${isNonEmptyArray(threadIds) ? `"recordId"` : `"sourceId"`} = ANY($2::uuid[])`,
      [threadObjectMetadataId, scopeIds],
    );

    await manager.query(
      `INSERT INTO ${schema}."recordShare"
         ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
       SELECT $1, thread.id, channel_role.role_id, 'ROLE', 'READ_WRITE', 'RULE', thread."channelId"
       FROM ${schema}."agentChatThread" thread
       JOIN unnest($3::uuid[], $4::uuid[]) AS channel_role(channel_id, role_id)
         ON channel_role.channel_id = thread."channelId"
       WHERE ${scopeCondition}
       ON CONFLICT DO NOTHING`,
      [
        threadObjectMetadataId,
        scopeIds,
        roleGrants.map(({ channelId }) => channelId),
        roleGrants.map(({ roleId }) => roleId),
      ],
    );
  }
}
