import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type EntityManager } from 'typeorm';

import { type AgentChatChannelGrantScope } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-grant-scope.type';
import { buildAgentChatChannelAccessQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-access-query.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const replaceAgentChatChannelRuleGrants = async ({
  manager,
  workspaceId,
  scope,
}: {
  manager: Pick<EntityManager, 'query'>;
  workspaceId: string;
  scope: AgentChatChannelGrantScope;
}): Promise<void> => {
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
};
